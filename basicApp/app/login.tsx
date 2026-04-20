import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter, Href } from 'expo-router';
import { useAuth } from '../context/AuthContext';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    clearError();
    
    if (!validateForm()) return;

    try {
      await login({ email, password });
      router.replace('/(app)' as Href);
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-12">
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 text-center">
              Welcome Back
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Sign in to your account
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Email</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 ${
                  formErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (formErrors.email) setFormErrors({ ...formErrors, email: undefined });
                }}
              />
              {formErrors.email && (
                <Text className="text-red-500 text-sm mt-1">{formErrors.email}</Text>
              )}
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Password</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (formErrors.password) setFormErrors({ ...formErrors, password: undefined });
                }}
              />
              {formErrors.password && (
                <Text className="text-red-500 text-sm mt-1">{formErrors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`rounded-lg py-4 mt-6 ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
