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
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { signup, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

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

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    clearError();
    
    if (!validateForm()) return;

    try {
      await signup({ name, email, password });
      router.replace('/(app)/index');
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
              Create Account
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              Sign up to get started
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-600 text-center">{error}</Text>
            </View>
          )}

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                }}
              />
              {formErrors.name && (
                <Text className="text-red-500 text-sm mt-1">{formErrors.name}</Text>
              )}
            </View>

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
                placeholder="Create a password"
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

            <View>
              <Text className="text-gray-700 font-medium mb-2">Confirm Password</Text>
              <TextInput
                className={`border rounded-lg px-4 py-3 text-gray-900 ${
                  formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: undefined });
                }}
              />
              {formErrors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              className={`rounded-lg py-4 mt-6 ${
                isLoading ? 'bg-blue-400' : 'bg-blue-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text className="text-blue-600 font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
