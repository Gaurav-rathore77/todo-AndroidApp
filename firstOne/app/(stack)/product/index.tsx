import { Button } from "@react-navigation/elements";
import { View, Text, TouchableOpacity, FlatList } from "react-native";

import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { TextInput } from "react-native";
// No AsyncStorage - using mock data

interface Product {
    _id: string;
    name: string;
    price: number;
    description?: string;
}

export default function Index() {
    const [data, setData] = useState<Product[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
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
        
        setData(prev => [...prev, newProduct]);
        setName("");
        setPrice("");
        setDescription("");
    };

    const handleProductClick = (id: string) => {
        router.push(`/product/${id}/page` as any);
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

                <Button onPress={handleSubmitForm}>Add Product</Button>
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
                        <View className="flex-row justify-between items-center">
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