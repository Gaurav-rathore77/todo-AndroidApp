import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lead, LEAD_STATUSES } from '../../types/crm';
import { useRouter } from 'expo-router';

interface LeadCardProps {
  lead: Lead;
  onPress?: () => void;
}

const getStatusStyle = (status: Lead['status']) => {
  const statusConfig = LEAD_STATUSES.find(s => s.value === status);
  return {
    bg: `${statusConfig?.color}15` || '#6B728015',
    text: statusConfig?.color || '#6B7280',
    label: statusConfig?.label || status.replace('_', ' '),
  };
};

export default function LeadCard({ lead, onPress }: LeadCardProps) {
  const router = useRouter();
  const statusStyle = getStatusStyle(lead.status);
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/(app)/leads/${lead._id}` as any);
    }
  };
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <Text className="text-base font-semibold text-gray-900 mb-0.5" numberOfLines={1}>
            {lead.name}
          </Text>
          {lead.company && (
            <Text className="text-sm text-gray-500" numberOfLines={1}>
              {lead.company}
            </Text>
          )}
        </View>
        
        <View 
          className="px-2.5 py-1 rounded-full"
          style={{ backgroundColor: statusStyle.bg }}
        >
          <Text 
            className="text-xs font-medium"
            style={{ color: statusStyle.text }}
          >
            {statusStyle.label}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center mb-3">
        <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
        <Text className="text-sm text-gray-600 ml-1.5 mr-4" numberOfLines={1}>
          {lead.email}
        </Text>
      </View>
      
      <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
        <View className="flex-row items-center">
          <Ionicons name="call-outline" size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-600 ml-1.5">
            {lead.phone}
          </Text>
        </View>
        
        <Text className="text-xs text-gray-400">
          {new Date(lead.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
