// Admin Panel - Manage Media Recordings
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getUserMediaRecordings, deleteMediaRecording } from '../../api/media';

export default function AdminPanel() {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'audio' | 'video'>('all');
  const router = useRouter();

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    setLoading(true);
    try {
      const userRecordings = await getUserMediaRecordings('admin');
      setRecordings(userRecordings);
    } catch (error) {
      console.error('Failed to load recordings:', error);
      Alert.alert('Error', 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recordingId: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMediaRecording(recordingId);
              setRecordings(prev => prev.filter(r => r.id !== recordingId));
              Alert.alert('Success', 'Recording deleted successfully');
            } catch (error) {
              console.error('Failed to delete recording:', error);
              Alert.alert('Error', 'Failed to delete recording');
            }
          },
        },
      ]
    );
  };

  const filteredRecordings = recordings.filter(recording => 
    filter === 'all' ? true : recording.type === filter
  );

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-purple-600 p-4 shadow-lg">
        <Text className="text-white text-xl font-bold text-center">Admin Panel 🛠️</Text>
        <Text className="text-purple-100 text-center text-sm mt-1">Manage Media Recordings</Text>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white p-4 shadow-sm">
        <View className="flex-row justify-center space-x-2">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-purple-500' : 'bg-gray-200'
            }`}
          >
            <Text className={`font-semibold ${
              filter === 'all' ? 'text-white' : 'text-gray-700'
            }`}>
              All ({recordings.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setFilter('audio')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'audio' ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <Text className={`font-semibold ${
              filter === 'audio' ? 'text-white' : 'text-gray-700'
            }`}>
              🎙️ Audio ({recordings.filter(r => r.type === 'audio').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setFilter('video')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'video' ? 'bg-green-500' : 'bg-gray-200'
            }`}
          >
            <Text className={`font-semibold ${
              filter === 'video' ? 'text-white' : 'text-gray-700'
            }`}>
              🎥️ Video ({recordings.filter(r => r.type === 'video').length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View className="p-4">
        <View className="flex-row justify-between">
          <View className="bg-white rounded-lg p-3 shadow-sm flex-1 mr-2">
            <Text className="text-2xl font-bold text-purple-600 text-center">
              {recordings.length}
            </Text>
            <Text className="text-gray-600 text-center text-sm">Total</Text>
          </View>
          
          <View className="bg-white rounded-lg p-3 shadow-sm flex-1 mr-2">
            <Text className="text-2xl font-bold text-blue-600 text-center">
              {recordings.filter(r => r.type === 'audio').length}
            </Text>
            <Text className="text-gray-600 text-center text-sm">Audio</Text>
          </View>
          
          <View className="bg-white rounded-lg p-3 shadow-sm flex-1">
            <Text className="text-2xl font-bold text-green-600 text-center">
              {recordings.filter(r => r.type === 'video').length}
            </Text>
            <Text className="text-gray-600 text-center text-sm">Video</Text>
          </View>
        </View>
      </View>

      {/* Recordings List */}
      <View className="flex-1 px-4">
        <Text className="text-lg font-semibold mb-4 text-gray-800">Media Recordings</Text>
        
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#9333EA" />
            <Text className="text-gray-600 mt-2">Loading recordings...</Text>
          </View>
        ) : filteredRecordings.length === 0 ? (
          <View className="flex-1 justify-center items-center py-8">
            <Text className="text-gray-500 text-center">No recordings found</Text>
            <Text className="text-gray-400 text-sm text-center mt-2">
              {filter === 'all' ? 'No recordings available' : `No ${filter} recordings found`}
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            {filteredRecordings.map((recording) => (
              <View key={recording.id} className="bg-white rounded-lg p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-2xl mr-2">
                        {recording.type === 'audio' ? '🎙️' : '🎥️'}
                      </Text>
                      <Text className="font-semibold text-gray-800">
                        {recording.type === 'audio' ? 'Audio' : 'Video'} Recording
                      </Text>
                      <Text className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded ml-2">
                        {recording.type.toUpperCase()}
                      </Text>
                    </View>
                    
                    <Text className="text-sm text-gray-600 mb-1">
                      Duration: {formatDuration(recording.duration || 0)}
                    </Text>
                    
                    {recording.metadata?.size && (
                      <Text className="text-sm text-gray-600 mb-1">
                        Size: {formatFileSize(recording.metadata.size)}
                      </Text>
                    )}
                    
                    <Text className="text-xs text-gray-500 mb-2">
                      {new Date(recording.timestamp).toLocaleString()}
                    </Text>
                    
                    {recording.transcript && (
                      <View className="bg-gray-50 p-2 rounded">
                        <Text className="font-semibold text-xs text-gray-600 mb-1">Transcript:</Text>
                        <Text className="text-xs text-gray-700 line-clamp-3">{recording.transcript}</Text>
                      </View>
                    )}
                    
                    {recording.url && (
                      <TouchableOpacity
                        onPress={() => console.log('Play recording:', recording.url)}
                        className="bg-blue-100 px-3 py-1 rounded mt-2 self-start"
                      >
                        <Text className="text-blue-600 text-xs font-semibold">▶️ Play</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View className="flex-column items-end">
                    <TouchableOpacity
                      onPress={() => handleDelete(recording.id)}
                      className="bg-red-100 p-2 rounded-lg mb-2"
                    >
                      <Text className="text-red-600 text-sm">🗑️ Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Bottom Actions */}
      <View className="p-4 bg-white border-t border-gray-200">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => router.push('/media-recorder')}
            className="flex-1 bg-green-500 py-3 rounded-lg"
          >
            <Text className="text-white font-bold text-center">🎙️🎥️ New Recording</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-1 bg-gray-500 py-3 rounded-lg"
          >
            <Text className="text-white font-bold text-center">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
