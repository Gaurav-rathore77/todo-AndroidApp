import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { crmAPI } from '../../../services/crmApi';
import { FollowUp, FollowUpStatus } from '../../../types/crm';
import { FollowUpCard, EmptyState } from '../../../components/crm';
import { Alert } from 'react-native';

export default function FollowUpsScreen() {
  const router = useRouter();
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FollowUpStatus | 'all'>('all');

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      const params: { status?: FollowUpStatus } = {};
      if (filter !== 'all') {
        params.status = filter;
      }
      const data = await crmAPI.getFollowUps(params);
      // Sort by scheduled date
      const sorted = data.sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
      setFollowUps(sorted);
    } catch (error) {
      console.error('Failed to load follow-ups:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFollowUps();
    setRefreshing(false);
  }, [filter]);

  useEffect(() => {
    loadFollowUps();
  }, [filter]);

  const handleComplete = async (id: string) => {
    try {
      await crmAPI.completeFollowUp(id);
      Alert.alert('Success', 'Follow-up marked as completed');
      loadFollowUps();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete follow-up');
    }
  };

  const getTodaysCount = () => {
    const today = new Date().toISOString().split('T')[0];
    return followUps.filter(f => 
      f.scheduledDate.startsWith(today) && f.status === 'pending'
    ).length;
  };

  const getPendingCount = () => followUps.filter(f => f.status === 'pending').length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Follow-ups</Text>
        
        {/* Summary Cards */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1 bg-amber-50 rounded-lg p-3">
            <Text className="text-2xl font-bold text-amber-600">{getTodaysCount()}</Text>
            <Text className="text-sm text-gray-600">Today's</Text>
          </View>
          <View className="flex-1 bg-blue-50 rounded-lg p-3">
            <Text className="text-2xl font-bold text-blue-600">{getPendingCount()}</Text>
            <Text className="text-sm text-gray-600">Pending</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-lg p-3">
            <Text className="text-2xl font-bold text-green-600">
              {followUps.filter(f => f.status === 'completed').length}
            </Text>
            <Text className="text-sm text-gray-600">Completed</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'completed', 'cancelled'] as const).map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setFilter(status)}
              className={`flex-1 py-2 rounded-md ${
                filter === status ? 'bg-white shadow-sm' : ''
              }`}
            >
              <Text
                className={`text-sm font-medium text-center capitalize ${
                  filter === status ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Follow-ups List */}
      <FlatList
        data={followUps}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <FollowUpCard
            followUp={item}
            onComplete={() => handleComplete(item._id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="calendar-outline"
              title="No follow-ups"
              subtitle="Schedule follow-ups with your leads"
            />
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push('/(app)/follow-ups/new' as any)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 4 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
