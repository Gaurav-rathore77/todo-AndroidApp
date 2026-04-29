import { useRouter } from "expo-router";
import { Button, View, Text } from "react-native";
export default function About() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-white p-6 justify-center items-center">
            <Text className="text-3xl font-bold text-gray-800 mb-6">About</Text>
            <Text className="text-gray-600 text-center mb-8">This is a demo application built with Expo Router and React Native.</Text>
            <Button title="Go to Home" onPress={() => router.replace("/")} />
        </View>
    );
}