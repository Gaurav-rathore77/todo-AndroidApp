import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FollowUp, FOLLOW_UP_TYPES } from '../../types/crm';

interface FollowUpCardProps {
  followUp: FollowUp;
  onComplete?: () => void;
  onPress?: () => void;
}

const getTypeIcon = (type: FollowUp['type']) => {
  switch (type) {
    case 'call':
      return { icon: 'call' as const, color: '#3B82F6' };
    case 'email':
      return { icon: 'mail' as const, color: '#8B5CF6' };
    case 'meeting':
      return { icon: 'people' as const, color: '#F59E0B' };
    case 'demo':
      return { icon: 'videocam' as const, color: '#EC4899' };
    default:
      return { icon: 'calendar' as const, color: '#6B7280' };
  }
};

const getStatusStyle = (status: FollowUp['status']) => {
  switch (status) {
    case 'completed':
      return { bg: '#10B98115', text: '#10B981', label: 'Completed' };
    case 'cancelled':
      return { bg: '#EF444415', text: '#EF4444', label: 'Cancelled' };
    default:
      return { bg: '#F59E0B15', text: '#F59E0B', label: 'Pending' };
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString();
};

export default function FollowUpCard({ followUp, onComplete, onPress }: FollowUpCardProps) {
  const typeInfo = getTypeIcon(followUp.type);
  const statusStyle = getStatusStyle(followUp.status);
  const typeLabel = FOLLOW_UP_TYPES.find(t => t.value === followUp.type)?.label || followUp.type;
  
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View 
          className="w-12 h-12 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${typeInfo.color}15` }}
        >
          <Ionicons name={typeInfo.icon} size={24} color={typeInfo.color} />
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-base font-semibold text-gray-900">
              {followUp.lead?.name || 'Unknown Lead'}
            </Text>
            
            <View 
              className="px-2 py-0.5 rounded-full"
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
          
          <Text className="text-sm text-gray-500 mb-2">
            {typeLabel}
          </Text>
          
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-600 ml-1.5">
              {formatDate(followUp.scheduledDate)}
            </Text>
            <Text className="text-sm text-gray-400 mx-1.5">•</Text>
            <Ionicons name="time-outline" size={14} color="#9CA3AF" />
            <Text className="text-sm text-gray-600 ml-1.5">
              {formatTime(followUp.scheduledDate)}
            </Text>
          </View>
          
          {followUp.notes && (
            <Text className="text-sm text-gray-500 mt-2" numberOfLines={2}>
              {followUp.notes}
            </Text>
          )}
        </View>
      </View>
      
      {followUp.status === 'pending' && onComplete && (
        <TouchableOpacity
          onPress={onComplete}
          className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-center"
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
          <Text className="text-sm font-medium text-green-600 ml-1.5">
            Mark as Complete
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
