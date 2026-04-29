import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { TextInput } from "react-native";
import { Button } from "@react-navigation/elements";
import { useUserStore } from "../store/user";
import { uploadImageFromUri } from "../api/image";

export default function Profile() {
    const user = useUserStore((s) => s.user);
    const logout = useUserStore((s) => s.logout);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [username, setUsername] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (user) {
            setUsername(user.username);
        }
    }, [user]);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const uploadProfileImage = async () => {
        if (!selectedImage) return null;
        
        setUploading(true);
        try {
            const fileName = `profile-${user?.id || Date.now()}.jpg`;
            const imageUrl = await uploadImageFromUri(selectedImage, fileName, 'profiles');
            return imageUrl;
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload profile image. Please try again.');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!username.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        const imageUrl = await uploadProfileImage();
        
        Alert.alert('Success', 'Profile updated successfully!');
        
        if (imageUrl) {
            setSelectedImage(null);
        }
    };

    const handleBack = () => {
        router.replace("/");
    };

    if (!user) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-4">
                <Text className="text-lg text-gray-600 mb-4">Please login to view profile</Text>
                <Button onPress={() => router.replace("/login" as any)}>Go to Login</Button>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 bg-blue-600">
                <Button onPress={handleBack}>Go to Home</Button>
                <Text className="text-xl font-bold text-white">Profile</Text>
                <View style={{ width: 80 }} />
            </View>

            <View className="p-4">
                {/* Profile Image */}
                <View className="items-center mb-6">
                    <TouchableOpacity 
                        onPress={pickImage}
                        className="relative"
                    >
                        <View className="w-32 h-32 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage }} className="w-full h-full" />
                            ) : (
                                <Text className="text-gray-400 text-4xl">👤</Text>
                            )}
                        </View>
                        <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                            <Text className="text-white text-sm">📷</Text>
                        </View>
                    </TouchableOpacity>
                    <Text className="text-sm text-gray-500 mt-2">Tap to change photo</Text>
                </View>

                {/* User Info Form */}
                <View className="bg-gray-50 rounded-lg p-4 mb-6">
                    <Text className="text-sm font-semibold text-gray-600 mb-1">Username</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md bg-white p-3 mb-3"
                        placeholder="Enter username"
                        value={username}
                        onChangeText={(text) => setUsername(text)}
                    />

                    <Text className="text-sm font-semibold text-gray-600 mb-1">User ID</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md bg-gray-100 p-3 mb-3"
                        value={user.id}
                        editable={false}
                    />

                    <Text className="text-sm font-semibold text-gray-600 mb-1">Email (Optional)</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md bg-white p-3 mb-4"
                        placeholder="Enter email"
                        keyboardType="email-address"
                    />
                </View>

                {/* Action Buttons */}
                <View className="space-y-3">
                    <Button onPress={handleUpdateProfile} disabled={uploading}>
                        {uploading ? 'Updating...' : 'Update Profile'}
                    </Button>

                    <TouchableOpacity
                        onPress={logout}
                        className="bg-red-500 py-4 rounded-lg"
                    >
                        <Text className="text-white text-center font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
