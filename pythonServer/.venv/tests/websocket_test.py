import asyncio
import websockets
import json


async def send_image_and_receive_results():
    uri = "ws://localhost:8765"
    async with websockets.connect(uri) as websocket:
        # Read an image file (change the path as needed)
        with open('../images/sample_image.jpg', 'rb') as file:
            image_data = file.read()

        # Encode the image data to hex string
        image_hex = image_data.hex()

        # Create a dictionary containing the image data
        data = {'image': image_hex}

        # Send the image data to the WebSocket server
        await websocket.send(json.dumps(data))

        # Receive and print the results from the WebSocket server
        results = await websocket.recv()
        print(results)


asyncio.run(send_image_and_receive_results())
