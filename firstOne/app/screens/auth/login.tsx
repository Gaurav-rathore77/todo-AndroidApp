import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "../../store/user";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    
    // Use store
    const { login, isLoading, error } = useUserStore();
    
    const handleSubmit = async () => {
        const success = await login(username, password);
        if (success) {
            router.push("/");
        }
    };
    
    return (
        <View className="flex-1 bg-blue-600 justify-center px-6">
            <View className="bg-white rounded-xl p-6 shadow-lg">
                <Text className="text-2xl font-bold text-blue-700 text-center mb-6">Login</Text>
                
                {error && (
                    <Text className="text-red-500 text-center mb-4">{error}</Text>
                )}

                <View className="mb-4">
                    <Text className="text-sm font-semibold text-blue-500 mb-2">Username</Text>
                    <TextInput 
                        className="border-b-2 border-blue-500 py-2 text-gray-800"
                        value={username} 
                        onChangeText={setUsername} 
                        placeholder="Enter username"
                        autoCapitalize="none"
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-sm font-semibold text-blue-500 mb-2">Password</Text>
                    <TextInput 
                        className="border-b-2 border-blue-500 py-2 text-gray-800"
                        value={password} 
                        onChangeText={setPassword} 
                        placeholder="Enter password"
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity 
                    disabled={isLoading}
                    className={`w-full py-3 rounded-lg ${isLoading ? 'bg-gray-400' : 'bg-blue-700'}`}
                    onPress={handleSubmit}
                >
                    <Text className="text-white font-bold text-center">
                        {isLoading ? 'Loading...' : 'Login'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => router.push('/screens/auth/register')}
                    className="mt-4"
                >
                    <Text className="text-blue-600 text-center text-sm">Don't have an account? Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
