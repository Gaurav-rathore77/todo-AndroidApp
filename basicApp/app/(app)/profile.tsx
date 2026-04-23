import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
    { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
    { icon: 'shield-outline', label: 'Privacy & Security', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white px-5 pt-8 pb-6 items-center">
        <View className="w-24 h-24 rounded-full bg-blue-600 items-center justify-center mb-4">
          <Text className="text-3xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-1">
          {user?.name || 'User'}
        </Text>
        <Text className="text-sm text-gray-500">
          {user?.email || 'user@example.com'}
        </Text>
      </View>

      {/* Stats */}
      <View className="flex-row bg-white mx-4 rounded-xl p-4 shadow-sm border border-gray-100 -mt-3">
        <View className="flex-1 items-center border-r border-gray-200">
          <Text className="text-xl font-bold text-gray-900">0</Text>
          <Text className="text-xs text-gray-500">Leads Added</Text>
        </View>
        <View className="flex-1 items-center border-r border-gray-200">
          <Text className="text-xl font-bold text-gray-900">0</Text>
          <Text className="text-xs text-gray-500">Follow-ups</Text>
        </View>
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold text-gray-900">0%</Text>
          <Text className="text-xs text-gray-500">Conversion</Text>
        </View>
      </View>

      {/* Menu */}
      <View className="mx-4 mt-4">
        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Settings
        </Text>
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              onPress={item.onPress}
              className={`flex-row items-center px-4 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <Ionicons name={item.icon as any} size={22} color="#6B7280" />
              <Text className="flex-1 text-base text-gray-900 ml-3">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout */}
      <View className="mx-4 mt-6 mb-8">
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-50 rounded-xl p-4 flex-row items-center justify-center border border-red-100"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-600 font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text className="text-center text-xs text-gray-400 mb-6">
        CRM App v1.0.0
      </Text>
    </ScrollView>
  );
}
