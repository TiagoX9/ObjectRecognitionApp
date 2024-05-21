import asyncio
import websockets
import tensorflow as tf
import numpy as np
import cv2
import json

# Load the pre-trained object detection model
MODEL_DIR = 'ssd_mobilenet_v2_coco_2018_03_29/saved_model'
model = tf.saved_model.load(str(MODEL_DIR))
infer = model.signatures['serving_default']

# Function to run inference on an image
def run_inference(image):
    input_tensor = tf.convert_to_tensor(image)
    input_tensor = input_tensor[tf.newaxis, ...]
    detections = infer(input_tensor)
    return detections

# WebSocket server to handle real-time image processing
async def process_image(websocket, path):
    async for message in websocket:
        # Decode the received image
        data = json.loads(message)
        image_data = np.frombuffer(bytes.fromhex(data['image']), dtype=np.uint8)
        image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Run inference on the image
        detections = run_inference(image_rgb)

        # Process the results
        num_detections = int(detections.pop('num_detections'))
        detections = {key: value[0, :num_detections].numpy() for key, value in detections.items()}

        detection_classes = detections['detection_classes'].astype(np.int64)
        detection_boxes = detections['detection_boxes']
        detection_scores = detections['detection_scores']

        # Prepare the results to be returned
        results = []
        for i in range(num_detections):
            if detection_scores[i] >= 0.5:
                box = detection_boxes[i].tolist()
                class_id = detection_classes[i]
                score = detection_scores[i]
                results.append({'box': box, 'class_id': class_id, 'score': score})

        # Send the results back to the client
        await websocket.send(json.dumps(results))

async def start_websocket_server():
    start_server = websockets.serve(process_image, 'localhost', 8765)
    await start_server

if __name__ == '__main__':
    asyncio.run(start_websocket_server())
