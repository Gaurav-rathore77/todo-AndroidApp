import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center justify-center py-12">
      <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name={icon} size={32} color="#9CA3AF" />
      </View>
      
      <Text className="text-base font-medium text-gray-700 mb-1">
        {title}
      </Text>
      
      {subtitle && (
        <Text className="text-sm text-gray-500 text-center px-8">
          {subtitle}
        </Text>
      )}
    </View>
  );
}
