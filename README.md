# ObjectRecognitionApp

Object recognition app made with Flask, Python and React Native for Masters Degree in Artificial Intelligence

# React Native and Flask App Documentation

This documentation covers the setup and running of a React Native application with a Flask backend for image object detection.

## Prerequisites

- Python 3.7+
- Node.js and npm
- React Native development environment
- Expo CLI
- Flask

## Backend Setup (Flask)

1. Create a new directory for your project and navigate into it:

   ```bash
   mkdir object-detection-app
   cd object-detection-app
   ```

2. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required Python packages:

   ```bash
   pip install flask tensorflow opencv-python-headless numpy websockets
   ```

4. Create a file named `app.py` and paste the provided Flask code into it.

5. Create a file named `label_map.py` and define your `label_map` dictionary for mapping class IDs to category names.

6. Download the pre-trained object detection model (ssd_mobilenet_v2_coco) and place it in a directory named `ssd_mobilenet_v2_coco/saved_model` in your project folder.

## Frontend Setup (React Native)

1. Create a new React Native project using Expo:

   ```bash
   expo init ObjectDetectionApp
   cd ObjectDetectionApp
   ```

2. Install the required npm packages:

   ```bash
   npm install axios expo-image-picker
   ```

3. Replace the contents of `App.js` (or `App.tsx` if using TypeScript) with the provided React Native code.

## Running the Application

### Starting the Flask Backend

1. Ensure you're in the directory containing `app.py` and your virtual environment is activated.

2. Run the Flask app:

   ```bash
   python app.py
   ```

   The Flask server should start running on `http://0.0.0.0:5001`.

### Starting the React Native Frontend

1. Navigate to your React Native project directory.

2. Start the Expo development server:

   ```bash
   expo start
   ```

3. Use the Expo Go app on your mobile device or an emulator to run the application.

## Usage

1. Launch the app on your device or emulator.
2. Tap "Upload Image" to select an image from your device.
3. Once an image is selected, tap "Identify Image" to send it to the Flask backend for object detection.
4. The app will display the detected object category and the confidence score.

## Troubleshooting

- Ensure that the Flask backend URL in the React Native code (`http://192.168.68.103:5001/predict`) matches your local IP address.
- If you encounter CORS issues, you may need to add CORS headers to your Flask app.
- Make sure all required Python packages and npm modules are correctly installed.

## Notes

- The backend uses TensorFlow for object detection. Ensure you have the correct TensorFlow version installed compatible with your system.
- The WebSocket server is set up but not currently used in the provided React Native code. It's available for future real-time processing implementations.
