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
import axios from "axios"

const App = () => {
  const [image, setImage] = useState<string | null>(null)
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        {!image && <Text>Please upload your image</Text>}
        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}
        <Button
          title={!image ? "Upload Image" : "Identify Image"}
          onPress={!image ? pickImage : () => console.warn("Identify image")}
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
})

export default App
