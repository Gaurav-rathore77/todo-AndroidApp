import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Button, Image, View, Text, ScrollView, StyleSheet } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as LocalAuthentication from "expo-local-authentication";
import * as Location from "expo-location";
import { Camera, CameraView } from "expo-camera";
import { Audio } from "expo-av";
import { useState ,useRef,useEffect} from "react";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 8,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  cameraContainer: {
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  }
});

export default function ImageScreen() {
      const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [image, setImage] = useState<string | null>(null);
   const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
   const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const cameraRef = useRef<any>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);

     const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("Permission denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(loc.coords);
  };

   const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });

    if (!result.canceled && result.assets.length > 0) {
      setFile(result);
    }
  };

    const startRecording = async () => {
    await Audio.requestPermissionsAsync();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    setRecording(recording);
  };

    const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    console.log("Audio URI:", uri);
  };

   useEffect(() => {
    (async () => {
      const cameraPerm = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPerm.status === "granted");
    })();
  }, []);

    const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      
      try {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        alert("📸 Photo saved to gallery successfully! ✅");
      } catch (error) {
        alert("❌ Failed to save photo: " + error);
        console.log("Save error:", error);
      }
    }
  };

  if (hasCameraPermission === null) return null;
  if (hasCameraPermission === false) return <View><Button title="No Access" /></View>;


    const handleAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      alert("Biometric not supported");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Authenticate with Fingerprint",
    });

    if (result.success) {
      alert("Authenticated");
    } else {
      alert("Failed");
    }
  };


  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Image Picker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Image Picker</Text>
          <View style={styles.buttonContainer}>
            <Button title="Pick Image" onPress={pickImage} />
          </View>
          {image && (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          )}
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.buttonContainer}>
            <Button title="Get Location" onPress={getLocation} />
          </View>
          {location && (
            <Text style={styles.locationText}>
              📍 Lat: {location.latitude?.toFixed(6)}, Lng: {location.longitude?.toFixed(6)}
            </Text>
          )}
        </View>

        {/* File Picker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📁 File Picker</Text>
          <View style={styles.buttonContainer}>
            <Button title="Pick File" onPress={pickFile} />
          </View>
          {file && file.assets && (
            <Text style={styles.fileName}>📄 {file.assets[0].name}</Text>
          )}
        </View>

        {/* Biometric Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Biometric Authentication</Text>
          <View style={styles.buttonContainer}>
            <Button title="Login with Fingerprint" onPress={handleAuth} />
          </View>
        </View>

        {/* Audio Recording Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎤 Audio Recording</Text>
          <View style={styles.buttonContainer}>
            <Button 
              title={recording ? "⏹️ Stop Recording" : "🎙️ Start Recording"} 
              onPress={recording ? stopRecording : startRecording} 
            />
          </View>
          {recording && (
            <Text style={styles.statusText}>🔴 Recording...</Text>
          )}
        </View>

        {/* Camera Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Camera</Text>
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={{ flex: 1 }} />
          </View>
          <View style={styles.buttonContainer}>
            <Button title="📸 Take Photo" onPress={takePhoto} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}