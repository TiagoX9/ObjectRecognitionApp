import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Button,
  Image,
  ActivityIndicator,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
// import { RNCamera, RNCameraProps } from "react-native-camera"
// import WebSocket from "react-native-websockets"
import axios, { AxiosResponse } from "axios"

const App = () => {
  const [image, setImage] = useState<string | null>(null)
  null
  const [imagePrediction, setImagePrediction] = useState<any | null>(null)
  null

  const pickImage = async () => {
    let result
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      })

      console.log("ImagePicker Result:", result)

      if (
        !result.canceled &&
        result.assets &&
        Array.isArray(result.assets) &&
        result.assets.length > 0
      ) {
        setImage(result.assets[0].uri)
      } else {
        console.log("Image picking was canceled or no assets found")
      }
    } catch (error) {
      console.error("Error picking image: ", error)
    }
  }

  const uploadImage = async (uri: string) => {
    const formData = new FormData()
    formData.append("image", {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any)
    try {
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
      const response = await axios.post(
        "http://192.168.68.103:5001/predict",
        formData,
        config
      )
      console.log("Server Response:", response.data)
      console.log("Server Response:", response.data)
      setImagePrediction(response.data)
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
        console.error("Response headers:", error.response.headers)
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request)
      } else {
        // Something happened in setting up the request that triggered an error
        console.error("Error setting up the request:", error.message)
      }
      console.error("Error uploading image: ", error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {!image && <Text>Please upload your image</Text>}

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}
        {imagePrediction && (
          <View style={styles.predictionBox}>
            <Text style={styles.categoryText}>
              {imagePrediction[0]
                ? imagePrediction[0].category.toUpperCase()
                : "None"}
            </Text>
            <Text style={styles.categoryAccuracy}>
              {imagePrediction[0]
                ? (imagePrediction[0].score * 100).toFixed(1)
                : "0"}
              {"% Accuracy"}
            </Text>
          </View>
        )}
        <Button
          title={!image ? "Upload Image" : "Identify Image"}
          onPress={!image ? pickImage : () => uploadImage(image)}
        />
        {image && <Button title={"Upload Image"} onPress={pickImage} />}
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    minHeight: 700,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
    borderWidth: 1,
    borderColor: "black",
  },
  image: {
    width: 300,
    height: 300,
  },
  predictionBox: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 30,
    fontWeight: "bold",
  },
  categoryAccuracy: {
    fontSize: 20,
    fontWeight: "bold",
  },
})

export default App
