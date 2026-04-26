import { Button } from "@react-navigation/elements";
import { View, Text, TouchableOpacity } from "react-native";

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
        const token = await AsyncStorage.getItem("token");
        fetch("http://localhost:3000/products", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setData(data))
            .catch((err) => console.error(err));
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
            {data.length === 0 ? (
                <Text className="text-gray-500 text-center mt-4">No products yet. Add your first product above!</Text>
            ) : (
                data.map((product: Product) => (
                    <TouchableOpacity 
                        key={product._id} 
                        onPress={() => handleProductClick(product._id)}
                        className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm"
                    >
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-lg font-semibold text-gray-800">{product.name}</Text>
                                {product.description && (
                                    <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>{product.description}</Text>
                                )}
                            </View>
                            <Text className="text-lg font-bold text-green-600">₹{product.price}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
    );
}