import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    content: string;
    similarity: number;
    metadata: any;
  }>;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  inputText: string;
}

const API_BASE_URL = 'http://10.225.255.35:5005/api/chat';

export default function ChatScreen() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    inputText: ''
  });

  // Add welcome message on component mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: 'नमस्ते! मैं आपके app का help desk हूं। Ye app karta kya hai, features kya hain - kuch bhi poochein! 😊',
      timestamp: new Date().toISOString()
    };
    setChatState(prev => ({
      ...prev,
      messages: [welcomeMessage]
    }));
  }, []);

  const sendMessage = async () => {
    if (!chatState.inputText.trim() || chatState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: chatState.inputText.trim(),
      timestamp: new Date().toISOString()
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      inputText: '',
      isLoading: true
    }));

    try {
      console.log('Sending request to:', `${API_BASE_URL}/chat`);
      console.log('Request body:', {
        message: userMessage.content,
        conversationHistory: chatState.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: chatState.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false
        }));
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please check your internet connection and try again.',
        timestamp: new Date().toISOString()
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }));
    }
  };

  const getAppOverview = async () => {
    setChatState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/app-info`);
      const data = await response.json();

      if (data.appInfo) {
        const overviewMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `📱 **App Information**\n\n**Name:** ${data.appInfo.name}\n**Type:** ${data.appInfo.type}\n**Description:** ${data.appInfo.description}\n\n**Main Features:**\n${data.features.map((f: string) => `• ${f}`).join('\n')}`,
          timestamp: new Date().toISOString()
        };

        setChatState(prev => ({
          ...prev,
          messages: [...prev.messages, overviewMessage],
          isLoading: false
        }));
      } else {
        throw new Error('Failed to get app info');
      }
    } catch (error) {
      console.error('Error getting overview:', error);
      Alert.alert('Error', 'Failed to get app overview');
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`my-2 mx-4 p-3 rounded-lg max-w-[85%] ${
        item.role === 'user'
          ? 'bg-blue-500 self-end'
          : 'bg-gray-200 self-start'
      }`}
    >
      <Text
        className={`text-sm ${
          item.role === 'user' ? 'text-white' : 'text-gray-800'
        }`}
      >
        {item.content}
      </Text>
      
      {item.sources && item.sources.length > 0 && (
        <View className="mt-2 pt-2 border-t border-gray-300">
          <Text className={`text-xs ${item.role === 'user' ? 'text-blue-100' : 'text-gray-600'}`}>
            📚 Sources used: {item.sources.length} documents
          </Text>
        </View>
      )}
      
      <Text
        className={`text-xs mt-1 ${
          item.role === 'user' ? 'text-blue-100' : 'text-gray-500'
        }`}
      >
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-xl font-bold text-gray-800">App Support 💬</Text>
        <TouchableOpacity
          onPress={getAppOverview}
          disabled={chatState.isLoading}
          className="bg-blue-100 px-3 py-1 rounded-full"
        >
          <Text className="text-blue-600 text-sm font-medium">App Info</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <FlatList
          data={chatState.messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 px-2"
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        <View className="border-t border-gray-200 p-2">
          {/* Quick Question Buttons */}
          <View className="px-2 pb-2">
            <Text className="text-xs text-gray-600 mb-2 font-medium">Quick Questions:</Text>
            <View className="flex-row flex-wrap gap-2">
              {['Ye app kya karta hai?', 'Login kaise karna hai?', 'Security features kya hain?', 'API endpoints kya hain?'].map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setChatState(prev => ({ ...prev, inputText: question }))}
                  className="bg-gray-100 px-3 py-1 rounded-full"
                >
                  <Text className="text-xs text-gray-700">{question}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <TextInput
              value={chatState.inputText}
              onChangeText={(text) =>
                setChatState(prev => ({ ...prev, inputText: text }))
              }
              placeholder="अपने app के बारे में पूछें..."
              multiline
              maxLength={500}
              className="flex-1 text-gray-800 mr-2 max-h-20"
              editable={!chatState.isLoading}
            />
            
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!chatState.inputText.trim() || chatState.isLoading}
              className={`p-2 rounded-full ${
                chatState.inputText.trim() && !chatState.isLoading
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
              }`}
            >
              {chatState.isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold">↑</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <Text className="text-xs text-gray-500 mt-1 text-center">
            {chatState.inputText.length}/500 characters
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
