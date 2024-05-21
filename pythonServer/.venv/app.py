import tensorflow as tf
import numpy as np
import cv2
from flask import Flask, request, jsonify

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

    return jsonify(results)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False, use_reloader=False)
