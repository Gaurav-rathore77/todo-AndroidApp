import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { crmAPI } from '../../services/crmApi';
import { DashboardStats, Activity, Lead } from '../../types/crm';
import { StatCard, ActivityItem, LeadCard, EmptyState } from '../../components/crm';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData, leadsData] = await Promise.all([
        crmAPI.getDashboardStats(),
        crmAPI.getRecentActivity(5),
        crmAPI.getLeads({ limit: 3, page: 1 }),
      ]);
      setStats(statsData);
      setActivities(activitiesData);
      setRecentLeads(leadsData.leads);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const navigateToLeads = () => router.push('/(app)/leads' as any);
  const navigateToFollowUps = () => router.push('/(app)/follow-ups' as any);

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-5">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Dashboard
            </Text>
            <Text className="text-sm text-gray-500 mt-0.5">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}
            </Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            onPress={() => router.push('/(app)/profile' as any)}
          >
            <Ionicons name="person" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="px-5 py-4">
        <View className="flex-row gap-3 mb-3">
          <StatCard
            title="Total Leads"
            value={stats?.totalLeads || 0}
            subtitle={`${stats?.newLeadsThisMonth || 0} new this month`}
            icon="people"
            color="#3B82F6"
          />
          <StatCard
            title="Today's Follow-ups"
            value={stats?.todaysFollowUps || 0}
            subtitle={`${stats?.pendingFollowUps || 0} pending`}
            icon="calendar"
            color="#F59E0B"
          />
        </View>
        
        <View className="flex-row gap-3">
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversionRate || 0}%`}
            subtitle="Leads to customers"
            icon="trending-up"
            color="#10B981"
          />
          <StatCard
            title="Active Leads"
            value={stats?.leadsByStatus?.reduce((acc, curr) => 
              ['new', 'contacted', 'qualified', 'proposal', 'negotiation'].includes(curr.status) 
                ? acc + curr.count 
                : acc, 0) || 0}
            subtitle="In pipeline"
            icon="pulse"
            color="#8B5CF6"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-5 mb-4">
        <Text className="text-base font-semibold text-gray-900 mb-3">
          Quick Actions
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={navigateToLeads}
            className="flex-1 bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center mr-3">
              <Ionicons name="people" size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-900">View Leads</Text>
              <Text className="text-xs text-gray-500">Manage all leads</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={navigateToFollowUps}
            className="flex-1 bg-white rounded-xl p-4 flex-row items-center shadow-sm border border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-amber-50 items-center justify-center mr-3">
              <Ionicons name="calendar" size={20} color="#F59E0B" />
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-900">Follow-ups</Text>
              <Text className="text-xs text-gray-500">Today's schedule</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-5 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-semibold text-gray-900">
            Recent Activity
          </Text>
          <TouchableOpacity onPress={() => router.push('/(app)/activity' as any)}>
            <Text className="text-sm text-blue-600">View All</Text>
          </TouchableOpacity>
        </View>
        
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <ActivityItem key={activity._id} activity={activity} />
            ))
          ) : (
            <EmptyState
              icon="time-outline"
              title="No recent activity"
              subtitle="Your recent actions will appear here"
            />
          )}
        </View>
      </View>

      {/* Recent Leads */}
      <View className="px-5 pb-6">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-base font-semibold text-gray-900">
            Recent Leads
          </Text>
          <TouchableOpacity onPress={navigateToLeads}>
            <Text className="text-sm text-blue-600">View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentLeads.length > 0 ? (
          recentLeads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onPress={navigateToLeads} />
          ))
        ) : (
          <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <EmptyState
              icon="people-outline"
              title="No leads yet"
              subtitle="Start by adding your first lead"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

