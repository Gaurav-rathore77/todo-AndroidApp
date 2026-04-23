import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex-1 min-w-[140px]">
      <View className="flex-row items-center justify-between mb-3">
        <View 
          className="w-10 h-10 rounded-lg items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {value}
      </Text>
      
      <Text className="text-sm font-medium text-gray-600 mb-0.5">
        {title}
      </Text>
      
      {subtitle && (
        <Text className="text-xs text-gray-400">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
