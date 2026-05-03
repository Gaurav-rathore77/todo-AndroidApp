import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';

export default function TestAPI() {
  const [email, setEmail] = useState('test3@example.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Test User');
  const [loading, setLoading] = useState(false);

  const testSignup = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://192.168.56.1:5003/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        Alert.alert('Success', 'Signup successful!');
        console.log('Response:', data);
      } else {
        Alert.alert('Error', data.message || 'Signup failed');
        console.log('Error:', data);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
      console.log('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    try {
      const response = await fetch('http://192.168.56.1:5003/api/health');
      const data = await response.json();
      Alert.alert('Health Check', JSON.stringify(data));
    } catch (error) {
      Alert.alert('Error', 'Cannot connect to server');
      console.log('Health check error:', error);
    }
  };

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <Text className="text-2xl font-bold text-center mb-8">API Test</Text>
      
      <View className="space-y-4">
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <TextInput
          className="border border-gray-300 rounded-lg p-3"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          onPress={testSignup}
          disabled={loading}
          className="bg-blue-600 rounded-lg p-4"
        >
          <Text className="text-white text-center font-semibold">
            {loading ? 'Testing...' : 'Test Signup'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={testHealth}
          className="bg-green-600 rounded-lg p-4"
        >
          <Text className="text-white text-center font-semibold">Test Health</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
