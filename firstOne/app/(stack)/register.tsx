import { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { registerApi } from '../api/auth';

interface UserData {
    username?: string;
    password?: string;
}

export default function Register() {
    const [data, setData] = useState<UserData>({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async () => {
        if (!data.username || !data.password) {
            console.error("Username and password required");
            return;
        }
        
        setLoading(true);
        try {
            const response = await registerApi({
                username: data.username!,
                password: data.password!
            });
            
            console.log("Registration successful:", response);
            
            // Redirect to login page
            router.push("/login");
        } catch (error) {
            console.error("Registration error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className='flex-1 bg-indigo-600 justify-center px-6'>
            <View className="bg-white rounded-xl p-6 shadow-lg">
                {/* Logo */}
                <View className="items-center mb-6">
                    <Image 
                        className="w-20 h-20" 
                        source={{ uri: 'https://img.icons8.com/fluent/344/year-of-tiger.png' }} 
                    />
                    <Text className="text-2xl font-bold text-indigo-700 mt-2">Register</Text>
                </View>

                {/* Username */}
                <View className="mb-4">
                    <Text className="text-sm font-semibold text-indigo-500 mb-2">Username</Text>
                    <TextInput 
                        className="border-b-2 border-indigo-500 py-2 text-gray-800"
                        value={data.username}
                        onChangeText={(text) => setData({...data, username: text})}
                        placeholder="Enter username"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password */}
                <View className="mb-6">
                    <Text className="text-sm font-semibold text-indigo-500 mb-2">Password</Text>
                    <TextInput 
                        className="border-b-2 border-indigo-500 py-2 text-gray-800"
                        secureTextEntry
                        value={data.password}
                        onChangeText={(text) => setData({...data, password: text})}
                        placeholder="Enter password"
                    />
                </View>

                {/* Submit */}
                <TouchableOpacity 
                    disabled={loading}
                    className={`w-full py-3 rounded-lg mb-4 ${loading ? 'bg-gray-400' : 'bg-indigo-700'}`}
                    onPress={handleSubmit}
                >
                    <Text className="text-white font-bold text-center">
                        {loading ? 'Loading...' : 'Submit'}
                    </Text>
                </TouchableOpacity>

                {/* Footer */}
                <View className="flex-row justify-between">
                    <TouchableOpacity onPress={() => router.push('/login')}>
                        <Text className="text-indigo-600 text-sm">Already have an account?</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}