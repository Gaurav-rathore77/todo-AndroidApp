import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "./store/user";

export default function Index() {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const navButton = (label: string, route: any, color: string = "bg-blue-500") => (
    <TouchableOpacity 
      className={`${color} px-4 py-3 rounded-lg mb-3 w-full`} 
      onPress={() => router.push(route)}
    >
      <Text className="text-white text-center font-semibold">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-blue-600 py-6 px-4">
        <Text className="text-2xl font-bold text-white text-center">My App</Text>
        <Text className="text-blue-100 text-center mt-1">Navigation Hub</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Auth Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          {user ? (
            <>
              <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                👤 Welcome, {user.username}!
              </Text>
              <TouchableOpacity 
                className="bg-red-500 px-4 py-3 rounded-lg w-full"
                onPress={logout}
              >
                <Text className="text-white text-center font-semibold">Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                🔐 Authentication
              </Text>
              {navButton("Register", "/screens/auth/register", "bg-green-500")}
              {navButton("Login", "/screens/auth/login", "bg-blue-500")}
            </>
          )}
        </View>

        {/* Product Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            Products
          </Text>
          {navButton("View All Products", "/screens/product", "bg-purple-500")}
          {navButton("Add New Product", "/screens/product", "bg-indigo-500")}
        </View>

        {/* Info Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            ℹInfo
          </Text>
          {navButton("About", "/screens/about", "bg-gray-600")}
        </View>
      </ScrollView>
    </View>
  );
}
