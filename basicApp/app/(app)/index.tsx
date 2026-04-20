import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center items-center">
        <Text className="text-3xl font-bold text-gray-900 mb-4">
          Welcome!
        </Text>
        
        {user && (
          <View className="bg-gray-50 rounded-lg p-6 w-full mb-6">
            <Text className="text-gray-600 mb-2">You are logged in as:</Text>
            <Text className="text-xl font-semibold text-gray-900">{user.name}</Text>
            <Text className="text-gray-500">{user.email}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-600 rounded-lg py-4 px-8 w-full"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
