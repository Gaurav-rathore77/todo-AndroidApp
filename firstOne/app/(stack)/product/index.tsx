import { Button } from "@react-navigation/elements";
import { View, Text, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';

import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { TextInput } from "react-native";
import { uploadImageFromUriFixed } from "../../../api/image-fixed";
import { useUserStore } from "../../store/user.native";
import { Product } from "../../../api/productService";
import { useProducts } from "../../../hooks/useProducts";
import { ErrorBoundary, LoadingSpinner, EmptyState } from "../../../components/ErrorBoundary";

export default function Index() {
    const router = useRouter();
    
    // Form state
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    // Global state with proper error handling
    const { 
        products, 
        loading, 
        error, 
        createProduct, 
        retry,
        clearError 
    } = useProducts();

    const handleBack = () => router.push("/");

    const handleSubmitForm = async () => {
        if (!name.trim() || !price.trim()) {
            Alert.alert('Validation Error', 'Please fill in all required fields');
            return;
        }

        try {
            // Upload image first if selected
            let imageUrl: string | undefined;
            if (selectedImage) {
                const uploadedUrl = await uploadProductImage();
                imageUrl = uploadedUrl || undefined;
            }

            // Create product using global state
            await createProduct({
                name: name.trim(),
                price: Number(price),
                description: description.trim(),
                image: imageUrl,
            });

            // Clear form on success
            resetForm();
            Alert.alert('Success', 'Product added successfully!');
        } catch (err) {
            // Error is already handled by global state
            console.error('Submit error:', err);
        }
    };

    const handleProductClick = (id: string) => {
        router.push(`/product/${id}/page` as any);
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to camera roll');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const uploadProductImage = async (): Promise<string | null> => {
        if (!selectedImage) return null;
        
        try {
            const fileName = `product-${Date.now()}.jpg`;
            const imageUrl = await uploadImageFromUriFixed(selectedImage, fileName, 'products');
            return imageUrl;
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
            return null;
        }
    };

    const resetForm = () => {
        setName("");
        setPrice("");
        setDescription("");
        setSelectedImage(null);
    };

    return (
        <View className="flex-1 bg-white p-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
                <Button onPress={handleBack}>Go to Home</Button>
                <Text className="text-xl font-bold text-gray-800">Add Product</Text>
                <View style={{ width: 80 }} />
            </View>

            {/* Form */}
            <View className="bg-gray-50 rounded-lg p-4 mb-6">
                {/* Image Upload */}
                <Text className="text-sm font-semibold text-gray-600 mb-1">Product Image</Text>
                <TouchableOpacity 
                    onPress={pickImage}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-3 items-center justify-center bg-white"
                >
                    {selectedImage ? (
                        <Image source={{ uri: selectedImage }} className="w-24 h-24 rounded-lg" />
                    ) : (
                        <View className="items-center">
                            <Text className="text-gray-400 text-3xl mb-2">📷</Text>
                            <Text className="text-gray-500 text-sm">Tap to add image</Text>
                        </View>
                    )}
                </TouchableOpacity>
                
                <Text className="text-sm font-semibold text-gray-600 mb-1">Product Name</Text>
                <TextInput
                    className="border border-gray-300 rounded-md bg-white p-3 mb-3"
                    placeholder="Enter product name"
                    value={name}
                    onChangeText={(text) => setName(text)}
                />

                <Text className="text-sm font-semibold text-gray-600 mb-1">Price</Text>
                <TextInput
                    className="border border-gray-300 rounded-md bg-white p-3 mb-3"
                    placeholder="Enter price"
                    value={price}
                    onChangeText={(text) => setPrice(text)}
                    keyboardType="numeric"
                />

                <Text className="text-sm font-semibold text-gray-600 mb-1">Description</Text>
                <TextInput
                    className="border border-gray-300 rounded-md bg-white p-3 mb-4"
                    placeholder="Enter description"
                    value={description}
                    onChangeText={(text) => setDescription(text)}
                    multiline
                    numberOfLines={2}
                />

                <Button onPress={handleSubmitForm} disabled={loading}>
                    {loading ? 'Uploading...' : 'Add Product'}
                </Button>
            </View>

            {/* Error Boundary */}
            <ErrorBoundary 
                error={error}
                onRetry={retry}
                onDismiss={clearError}
            >
                {/* Products List */}
                <Text className="text-lg font-bold text-gray-800 mb-3">Your Products</Text>
                <FlatList
                    data={products}
                    keyExtractor={(item: Product) => item._id}
                    ListEmptyComponent={
                        <EmptyState 
                            title="No products yet" 
                            description="Add your first product above!" 
                        />
                    }
                    renderItem={({ item }: { item: Product }) => (
                        <TouchableOpacity
                            onPress={() => handleProductClick(item._id)}
                            className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
                        >
                            <View className="flex-row items-center">
                                {item.image && (
                                    <Image source={{ uri: item.image }} className="w-16 h-16 rounded-lg mr-3" />
                                )}
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
                                    {item.description && (
                                        <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>{item.description}</Text>
                                    )}
                                </View>
                                <Text className="text-lg font-bold text-green-600">₹{item.price}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </ErrorBoundary>
        </View>
    );
}