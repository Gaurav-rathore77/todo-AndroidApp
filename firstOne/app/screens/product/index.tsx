import { Button } from "@react-navigation/elements";
import { View, Text, TouchableOpacity } from "react-native";

import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

interface Product {
    id: number;
    name: string;
    price: number;
}

export default function Index() {
    const [data, setData] = useState<Product[]>([]);

    const router = useRouter();

    const handleBack = () => {
        router.push("/");
    };
    const handleSubmitForm = () => {
        console.log("Form submitted");
    };

    const handleProductClick = (id: number) => {
        router.push(`/screens/product/${id}/page`);
    };

    useEffect(() => {
        fetch("http://localhost:3000/products")
            .then((res) => res.json())
            .then((data) => setData(data));
    }, []);
    
    return (
        <View>
            <Text>Product</Text>
            <Button onPress={handleBack}>Go to Home</Button>
            <Button onPress={handleSubmitForm}>Submit Form</Button>
            {data.map((product: Product) => (
                <TouchableOpacity key={product.id} onPress={() => handleProductClick(product.id)}>
                    <Text>{product.name}</Text>
                    <Text>{product.price}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}