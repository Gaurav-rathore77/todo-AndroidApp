import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { crmAPI, CreateLeadData } from '../../../services/crmApi';
import { LEAD_SOURCES, LeadSource, LeadStatus, LEAD_STATUSES } from '../../../types/crm';

export default function NewLeadScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateLeadData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    notes: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await crmAPI.createLead(formData);
      Alert.alert('Success', 'Lead created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreateLeadData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Basic Information */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Basic Information</Text>
          
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Full Name <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="John Doe"
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Email <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="john@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1.5">
              Phone <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={formData.phone}
              onChangeText={(value) => updateField('phone', value)}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Company</Text>
            <TextInput
              value={formData.company}
              onChangeText={(value) => updateField('company', value)}
              placeholder="Acme Inc."
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-base text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Lead Source */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Lead Source</Text>
          <View className="flex-row flex-wrap">
            {LEAD_SOURCES.map((source) => (
              <TouchableOpacity
                key={source.value}
                onPress={() => updateField('source', source.value)}
                className={`mr-2 mb-2 px-4 py-2 rounded-full border ${
                  formData.source === source.value
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    formData.source === source.value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {source.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Notes</Text>
          <TextInput
            value={formData.notes}
            onChangeText={(value) => updateField('notes', value)}
            placeholder="Add any additional notes about this lead..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-base text-gray-900 min-h-[100]"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`rounded-xl py-4 px-6 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        >
          <Text className="text-white text-center font-semibold text-base">
            {loading ? 'Creating...' : 'Create Lead'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
