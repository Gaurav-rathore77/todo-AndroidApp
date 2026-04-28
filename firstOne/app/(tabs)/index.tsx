import { Text, Pressable, View, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "../store/user";
import { useState } from "react";

function Sidebar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const navItem = (label: string, route: any, icon: string) => (
    <Pressable
      onPress={() => {
        router.push(route);
        onClose();
      }}
      className="px-4 py-4 border-b border-gray-100 flex-row items-center"
    >
      <Text className="text-2xl mr-4">{icon}</Text>
      <Text className="text-gray-800 font-medium text-lg">{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-white h-3/4 rounded-t-3xl">
          {/* Header */}
          <View className="bg-indigo-600 p-6 rounded-t-3xl flex-row justify-between items-center">
            <View>
              <Text className="text-white text-xl font-bold">
                {user ? `👤 ${user.username}` : "My App"}
              </Text>
              <Text className="text-indigo-200 text-sm mt-1">
                {user ? "Logged In" : "Guest User"}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <Text className="text-white text-2xl">✕</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1">
            {navItem("Home", "/", "")}
            {navItem("Products", "/product" as any,"")}
            {navItem("About", "/about" as any, "")}
            
            {user && (
              <>
                <View className="h-px bg-gray-200 my-2 mx-4" />
                {navItem("Admin Panel", "/admin" as any, "⚙️")}
              </>
            )}

            <View className="p-4 mt-4">
              {user ? (
                <Pressable
                  onPress={() => {
                    logout();
                    onClose();
                  }}
                  className="bg-red-500 py-4 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">Logout</Text>
                </Pressable>
              ) : (
                <>
                  <Pressable
                    onPress={() => { router.push("/login" as any); onClose(); }}
                    className="bg-blue-600 py-4 rounded-lg mb-3"
                  >
                    <Text className="text-white text-center font-semibold">Login</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => { router.push("/register" as any); onClose(); }}
                    className="bg-green-500 py-4 rounded-lg"
                  >
                    <Text className="text-white text-center font-semibold">Register</Text>
                  </Pressable>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function HomeTab() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <View className="flex-1 bg-gray-100">
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Header with Hamburger */}
      <View className="bg-blue-600 py-4 px-4 flex-row items-center">
        <Pressable 
          onPress={() => setSidebarOpen(true)}
          className="p-2 bg-white/20 rounded-lg mr-4"
        >
          <Text className="text-2xl text-white">☰</Text>
        </Pressable>
        <View>
          <Text className="text-xl font-bold text-white">My App</Text>
          <Text className="text-blue-100 text-xs">
            {user ? `Welcome, ${user.username}` : "Guest"}
          </Text>
        </View>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {/* Welcome Card for Guests */}
        {!user && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              👋 Welcome Guest!
            </Text>
            <Text className="text-gray-600 mb-3">
              You can browse all products and view details without logging in.
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                className="flex-1 bg-blue-600 px-4 py-3 rounded-lg"
                onPress={() => router.push("/login" as any)}
              >
                <Text className="text-white text-center font-semibold">Login</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-green-500 px-4 py-3 rounded-lg"
                onPress={() => router.push("/register" as any)}
              >
                <Text className="text-white text-center font-semibold">Register</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Product Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            📦 Products
          </Text>
          <Text className="text-gray-600 mb-3">
            Browse and view all available products
          </Text>
          <Pressable
              className="bg-purple-500 px-4 py-3 rounded-lg w-full mb-3"
              onPress={() => router.push("/product" as any)}
            >
              <Text className="text-white text-center font-semibold">View All Products</Text>
            </Pressable>
        </View>

        {/* Auth User Section */}
        {user && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              👤 My Account
            </Text>
            <Text className="text-gray-600 mb-3">Username: {user.username}</Text>
            <Pressable
              onPress={logout}
              className="bg-red-500 px-4 py-3 rounded-lg w-full"
            >
              <Text className="text-white text-center font-semibold">Logout</Text>
            </Pressable>
          </View>
        )}

        {/* Info Section */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            ℹ️ Info
          </Text>
          <Pressable
              className="bg-gray-600 px-4 py-3 rounded-lg w-full mb-3"
              onPress={() => router.push("/about" as any)}
            >
              <Text className="text-white text-center font-semibold">About</Text>
            </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
