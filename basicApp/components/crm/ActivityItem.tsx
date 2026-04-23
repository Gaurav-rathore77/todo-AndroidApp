import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../../types/crm';

interface ActivityItemProps {
  activity: Activity;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'lead_created':
      return { icon: 'person-add' as const, color: '#10B981' };
    case 'lead_updated':
      return { icon: 'create' as const, color: '#3B82F6' };
    case 'follow_up_created':
      return { icon: 'calendar' as const, color: '#8B5CF6' };
    case 'follow_up_completed':
      return { icon: 'checkmark-circle' as const, color: '#10B981' };
    case 'status_changed':
      return { icon: 'swap-horizontal' as const, color: '#F59E0B' };
    case 'note_added':
      return { icon: 'document-text' as const, color: '#6B7280' };
    default:
      return { icon: 'information-circle' as const, color: '#6B7280' };
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Yesterday';
  }
  return `${diffInDays}d ago`;
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const { icon, color } = getActivityIcon(activity.type);
  
  return (
    <View className="flex-row items-start py-3 border-b border-gray-100 last:border-b-0">
      <View 
        className="w-9 h-9 rounded-full items-center justify-center mr-3 mt-0.5"
        style={{ backgroundColor: `${color}15` }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      
      <View className="flex-1">
        <Text className="text-sm text-gray-800 leading-5 mb-1">
          {activity.description}
        </Text>
        
        <View className="flex-row items-center">
          <Text className="text-xs text-gray-400">
            {formatTime(activity.createdAt)}
          </Text>
          {activity.leadName && (
            <>
              <Text className="text-xs text-gray-300 mx-1">•</Text>
              <Text className="text-xs text-gray-500" numberOfLines={1}>
                {activity.leadName}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}
