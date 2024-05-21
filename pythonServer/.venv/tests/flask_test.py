import requests

# Define the URL of your Flask server
url = 'http://127.0.0.1:5001/predict'

# Read an image file (change the path as needed)
with open('../images/sample_image.jpg', 'rb') as file:
    image = file.read()

# Create a dictionary containing the image file
files = {'image': image}

# Send a POST request to the /predict endpoint
response = requests.post(url, files=files)

# Print the response
print(response.json())
