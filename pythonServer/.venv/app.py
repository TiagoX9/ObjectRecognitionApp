# app.py

import asyncio
import websockets
import tensorflow as tf
import numpy as np
import cv2
import json
from flask import Flask, request, jsonify
from threading import Thread
from label_map import label_map  # Import label mappings from label_map.py

# Load the pre-trained object detection model
MODEL_DIR = 'ssd_mobilenet_v2_coco/saved_model'
model = tf.saved_model.load(str(MODEL_DIR))
infer = model.signatures['serving_default']


# Function to run inference on an image
def run_inference(image):
    input_tensor = tf.convert_to_tensor(image)
    input_tensor = input_tensor[tf.newaxis, ...]

    detections = infer(input_tensor)

    return detections


# Initialize Flask application for handling image uploads
app = Flask(__name__)


@app.route('/predict', methods=['POST'])
def predict():
    # Get the image file from the request
    file = request.files['image']

    # Decode the image
    image = np.array(cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR))
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Run inference on the image
    detections = run_inference(image_rgb)

    # Process the results
    num_detections = int(detections.pop('num_detections'))
    detections = {key: value[0, :num_detections].numpy() for key, value in detections.items()}

    # Convert detection results to Python lists if necessary
    for key in detections:
        detections[key] = detections[key].tolist()

    # Map class IDs to category names using label_map
    results = []
    for i in range(num_detections):
        if detections['detection_scores'][i] >= 0.5:
            class_id = int(detections['detection_classes'][i])  # Convert to int
            category = label_map.get(class_id, 'unknown')  # Get category name or 'unknown' if not found
            box = detections['detection_boxes'][i]
            score = detections['detection_scores'][i]
            results.append({'box': box, 'category': category, 'score': score})

    return jsonify(results)


# WebSocket server to handle real-time image processing
async def process_image(websocket, path):
    async for message in websocket:
        # Decode the received image
        data = json.loads(message)
        image_data = np.frombuffer(base64.b64decode(data['image']), dtype=np.uint8)
        image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Run inference on the image
        detections = run_inference(image_rgb)

        # Process the results
        num_detections = int(detections.pop('num_detections'))
        detections = {key: value[0, :num_detections].numpy() for key, value in detections.items()}

        # Convert detection results to Python lists if necessary
        for key in detections:
            detections[key] = detections[key].tolist()

        # Map class IDs to category names using label_map
        results = []
        for i in range(num_detections):
            if detections['detection_scores'][i] >= 0.5:
                class_id = int(detections['detection_classes'][i])  # Convert to int
                category = label_map.get(class_id, 'unknown')  # Get category name or 'unknown' if not found
                box = detections['detection_boxes'][i]
                score = detections['detection_scores'][i]
                results.append({'box': box, 'category': category, 'score': score})

        # Send the results back to the client
        await websocket.send(json.dumps(results))


async def start_websocket_server():
    start_server = websockets.serve(process_image, 'localhost', 8765)
    await start_server


# Run both Flask and WebSocket server
def run_flask():
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)


if __name__ == '__main__':
    # Start Flask app on a different thread
    flask_thread = Thread(target=run_flask)
    flask_thread.start()

    # Start asyncio event loop for WebSocket server
    try:
        asyncio.run(start_websocket_server())
    except KeyboardInterrupt:
        pass
    finally:
        flask_thread.join()
