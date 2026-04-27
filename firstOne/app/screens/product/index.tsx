import { Button } from "@react-navigation/elements";
import { View, Text, TouchableOpacity, FlatList } from "react-native";

import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
            const token = await AsyncStorage.getItem("token");
            const response = await fetch("http://localhost:3000/product", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await response.json();
            if (Array.isArray(result)) {
                setData(result);
            } else {
                console.error("Expected array, got:", result);
                setData([]);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setData([]);
        }
    };

    const handleSubmitForm = async () => {
        const token = await AsyncStorage.getItem("token");
        fetch("http://localhost:3000/product/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, price: Number(price), description }),
        })
            .then((res) => res.json())
            .then(() => {
                setName("");
                setPrice("");
                setDescription("");
                fetchProducts();
            })
            .catch((err) => console.error(err));
    };

    const handleProductClick = (id: string) => {
        router.push(`/screens/product/${id}/page`);
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