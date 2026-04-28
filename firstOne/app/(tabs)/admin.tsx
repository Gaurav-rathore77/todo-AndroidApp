import { Text, TouchableOpacity, View, ScrollView, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useUserStore } from "../store/user";
import { useState } from "react";

function Sidebar({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const { user, logout } = useUserStore();

  const navItem = (label: string, route: any, icon: string) => (
    <TouchableOpacity
      onPress={() => { router.push(route); onClose(); }}
      className="px-4 py-4 border-b border-gray-100 flex-row items-center"
    >
      <Text className="text-2xl mr-4">{icon}</Text>
      <Text className="text-gray-800 font-medium text-lg">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 bg-black/50">
        <TouchableOpacity className="flex-1" onPress={onClose} />
        <View className="bg-white h-3/4 rounded-t-3xl">
          <View className="bg-indigo-600 p-6 rounded-t-3xl flex-row justify-between items-center">
            <View>
              <Text className="text-white text-xl font-bold">{user ? `👤 ${user.username}` : "My App"}</Text>
              <Text className="text-indigo-200 text-sm mt-1">{user ? "Logged In" : "Guest"}</Text>
            </View>
            <TouchableOpacity onPress={onClose}><Text className="text-white text-2xl">✕</Text></TouchableOpacity>
          </View>
          <ScrollView className="flex-1">
            {navItem("Home", "/", "🏠")}
            {navItem("Products", "/product/index" as any, "📦")}
            {navItem("About", "/about" as any, "ℹ️")}
            {user && <>{navItem("Admin Panel", "/admin" as any, "⚙️")}</>}
            <View className="p-4 mt-4">
              {user ? (
                <TouchableOpacity onPress={() => { logout(); onClose(); }} className="bg-red-500 py-4 rounded-lg">
                  <Text className="text-white text-center font-semibold">Logout</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity onPress={() => { router.push("/auth/login" as any); onClose(); }} className="bg-blue-600 py-4 rounded-lg mb-3">
                    <Text className="text-white text-center font-semibold">Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { router.push("/auth/register" as any); onClose(); }} className="bg-green-500 py-4 rounded-lg">
                    <Text className="text-white text-center font-semibold">Register</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Header with Hamburger */}
      <View className="bg-indigo-600 py-4 px-4 flex-row items-center">
        <TouchableOpacity 
          onPress={() => setSidebarOpen(true)}
          className="p-2 bg-white/20 rounded-lg mr-4"
        >
          <Text className="text-2xl text-white">☰</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-white">⚙️ Admin</Text>
          <Text className="text-indigo-100 text-xs">
            {user ? user.username : "Guest"}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* User Info Card */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            👤 Current User
          </Text>
          {user ? (
            <>
              <View className="mb-2">
                <Text className="text-gray-500 text-sm">Username</Text>
                <Text className="text-gray-800 font-semibold">{user.username}</Text>
              </View>
              <View className="mb-2">
                <Text className="text-gray-500 text-sm">User ID</Text>
                <Text className="text-gray-400 text-xs">{user.id}</Text>
              </View>
            </>
          ) : (
            <Text className="text-red-500">Not logged in</Text>
          )}
        </View>

        {/* Product Management */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            📦 Product Management
          </Text>
          {navButton("View All Products", "/product/index" as any, "bg-purple-500")}
          {navButton("Add New Product", "/product/index" as any, "bg-indigo-500")}
        </View>

        {/* Quick Actions */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
            ⚡ Quick Actions
          </Text>
          {navButton("Go to Home", "/", "bg-blue-500")}
          {navButton("About App", "/about" as any, "bg-gray-600")}
        </View>

        {/* Logout Section */}
        {user && (
          <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              🚪 Session
            </Text>
            <TouchableOpacity
              onPress={logout}
              className="bg-red-500 px-4 py-3 rounded-lg w-full"
            >
              <Text className="text-white text-center font-semibold">Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
