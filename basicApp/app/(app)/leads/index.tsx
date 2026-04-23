import { View, Text, FlatList, TouchableOpacity, RefreshControl, TextInput, ScrollView } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { crmAPI } from '../../../services/crmApi';
import { Lead, LeadStatus, LEAD_STATUSES } from '../../../types/crm';
import { LeadCard, EmptyState } from '../../../components/crm';

export default function LeadsScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadLeads = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const data = await crmAPI.getLeads({
        search: searchQuery || undefined,
        status: selectedStatus || undefined,
        page: pageNum,
        limit: 20,
      });
      
      setLeads(prev => reset || pageNum === 1 ? data.leads : [...prev, ...data.leads]);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeads(1, true);
    setRefreshing(false);
  }, [searchQuery, selectedStatus]);

  const loadMore = () => {
    if (page < totalPages && !loading) {
      loadLeads(page + 1);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadLeads(1, true);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedStatus]);

  const navigateToAddLead = () => router.push('/(app)/leads/new' as any);
  const navigateToLeadDetail = (id: string) => router.push(`/(app)/leads/${id}` as any);

  const renderStatusFilter = () => (
    <View className="px-4 py-3 bg-white border-b border-gray-200">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          onPress={() => setSelectedStatus(null)}
          className={`mr-2 px-4 py-2 rounded-full ${
            selectedStatus === null ? 'bg-blue-600' : 'bg-gray-100'
          }`}
        >
          <Text className={`text-sm font-medium ${
            selectedStatus === null ? 'text-white' : 'text-gray-700'
          }`}>
            All
          </Text>
        </TouchableOpacity>
        {LEAD_STATUSES.map((status) => (
          <TouchableOpacity
            key={status.value}
            onPress={() => setSelectedStatus(status.value)}
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedStatus === status.value ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text className={`text-sm font-medium ${
              selectedStatus === status.value ? 'text-white' : 'text-gray-700'
            }`}>
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Leads</Text>
          <TouchableOpacity
            onPress={navigateToAddLead}
            className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
          >
            <Ionicons name="add" size={18} color="white" />
            <Text className="text-white font-medium ml-1">Add Lead</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2.5">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search leads..."
            className="flex-1 ml-2 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filter */}
      {renderStatusFilter()}

      {/* Leads List */}
      <FlatList
        data={leads}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <LeadCard
            lead={item}
            onPress={() => navigateToLeadDetail(item._id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="people-outline"
              title="No leads found"
              subtitle={searchQuery ? "Try adjusting your search" : "Add your first lead to get started"}
            />
          ) : null
        }
      />

      {/* FAB for quick add */}
      <TouchableOpacity
        onPress={navigateToAddLead}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg"
        style={{ elevation: 4 }}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
