import { Button } from "@react-navigation/elements";
import { View, Text, TouchableOpacity, FlatList, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';

import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { TextInput } from "react-native";
import { uploadImageFromUri } from "../../api/image";
// No AsyncStorage - using mock data

interface Product {
    _id: string;
    name: string;
    price: number;
    description?: string;
    image?: string;
}

export default function Index() {
    const [data, setData] = useState<Product[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();

    const handleBack = () => {
        router.push("/");
    };

    const fetchProducts = async () => {
        try {
            // Mock data for now
            const mockProducts: Product[] = [
                { _id: "1", name: "Mock Product 1", price: 100, description: "Test product" },
                { _id: "2", name: "Mock Product 2", price: 200, description: "Another test" }
            ];
            setData(mockProducts);
        } catch (error) {
            console.error("Fetch error:", error);
        }
    };

    const handleSubmitForm = async () => {
        // Mock add product
        const newProduct: Product = {
            _id: Date.now().toString(),
            name,
            price: Number(price),
            description
        };
        
        const imageUrl = await uploadProductImage();
        if (imageUrl) {
            newProduct.image = imageUrl;
        }
        
        setData(prev => [...prev, newProduct]);
        setName("");
        setPrice("");
        setDescription("");
        setSelectedImage(null);
    };

    const handleProductClick = (id: string) => {
        router.push(`/product/${id}/page` as any);
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
            Alert.alert('Permission to access camera roll is required!');
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

    const uploadProductImage = async () => {
        if (!selectedImage) return null;
        
        setUploading(true);
        try {
            const fileName = `product-${Date.now()}.jpg`;
            const imageUrl = await uploadImageFromUri(selectedImage, fileName, 'products');
            return imageUrl;
        } catch (error) {
            Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
            return null;
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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

                <Button onPress={handleSubmitForm} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Add Product'}
                </Button>
            </View>

            {/* Products List */}
            <Text className="text-lg font-bold text-gray-800 mb-3">Your Products</Text>
            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={
                    <Text className="text-gray-500 text-center mt-4">No products yet. Add your first product above!</Text>
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
        </View>
    );
}