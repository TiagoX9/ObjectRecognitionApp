import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Button,
  Image,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { RNCamera, RNCameraProps } from "react-native-camera"
import WebSocket from "react-native-websockets"
import axios from "axios"

// Define types for detection results
interface DetectionResult {
  box: number[]
  class_id: number
  score: number
}

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<DetectionResult[]>([])

  const ws = useRef<WebSocket | null>(null)
  const camera = useRef<RNCamera>(null)

  useEffect(() => {
    ws.current = new WebSocket("ws://your-server-ip:8765")
    ws.current.onmessage = (e: WebSocketMessageEvent) => {
      const response: DetectionResult[] = JSON.parse(e.data)
      setResults(response)
      setLoading(false)
    }
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      setImage(result.uri)
      setLoading(true)
      const formData = new FormData()
      formData.append("image", {
        uri: result.uri,
        type: "image/jpeg",
        name: "photo.jpg",
      })

      // Send the image to the server for processing
      axios
        .post("http://your-server-ip:5000/predict", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          setResults(response.data)
          setLoading(false)
        })
        .catch((error) => {
          console.error(error)
          setLoading(false)
        })
    }
  }

  const handleCapture = async () => {
    if (camera.current) {
      setLoading(true)
      const options = { quality: 0.5, base64: true }
      const data = await camera.current.takePictureAsync(options)
      const imageBase64 = data.base64
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ image: imageBase64 }))
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Button to pick an image from the gallery */}
      <Button title="Pick an image from camera roll" onPress={pickImage} />

      {/* Button to capture an image using the camera */}
      <Button title="Capture image with camera" onPress={handleCapture} />

      {/* Display the selected or captured image */}
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />
      )}

      {/* Camera preview */}
      <RNCamera
        ref={camera}
        style={styles.preview}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
      />

      {/* Show loading indicator while processing */}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Display the results from the server */}
      {results.length > 0 && (
        <View style={styles.results}>
          {results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              Class ID: {result.class_id}, Score: {result.score.toFixed(2)}
            </Text>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    width: "100%",
    height: 300,
    marginTop: 20,
  },
  results: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    margin: 5,
  },
})

export default App
