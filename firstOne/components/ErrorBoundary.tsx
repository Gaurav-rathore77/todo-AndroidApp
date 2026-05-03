import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

interface ErrorBoundaryProps {
    error?: string | null;
    onRetry?: () => void;
    onDismiss?: () => void;
    children?: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
    error,
    onRetry,
    onDismiss,
    children
}) => {
    if (!error) {
        return <>{children}</>;
    }

    return (
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
            <View className="flex-row items-start">
                <View className="flex-1">
                    <Text className="text-red-800 font-semibold text-lg mb-2">
                        ⚠️ Error
                    </Text>
                    <Text className="text-red-600 text-sm mb-4">
                        {error}
                    </Text>
                    
                    <View className="flex-row space-x-3">
                        {onRetry && (
                            <TouchableOpacity
                                onPress={onRetry}
                                className="bg-red-600 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-white font-medium text-sm">
                                    🔄 Retry
                                </Text>
                            </TouchableOpacity>
                        )}
                        
                        {onDismiss && (
                            <TouchableOpacity
                                onPress={onDismiss}
                                className="bg-gray-300 px-4 py-2 rounded-lg"
                            >
                                <Text className="text-gray-700 font-medium text-sm">
                                    ✕ Dismiss
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

// Loading State Component
export const LoadingSpinner: React.FC<{ message?: string }> = ({ 
    message = 'Loading...' 
}) => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-50">
            <View className="items-center">
                <Text className="text-4xl mb-4">⏳</Text>
                <Text className="text-gray-600 text-lg">{message}</Text>
            </View>
        </View>
    );
};

// Empty State Component
export const EmptyState: React.FC<{
    title: string;
    description?: string;
    action?: {
        label: string;
        onPress: () => void;
    };
}> = ({ title, description, action }) => {
    return (
        <View className="flex-1 justify-center items-center bg-gray-50 p-8">
            <View className="items-center">
                <Text className="text-6xl mb-4">📦</Text>
                <Text className="text-gray-800 text-xl font-semibold mb-2 text-center">
                    {title}
                </Text>
                {description && (
                    <Text className="text-gray-600 text-center mb-6">
                        {description}
                    </Text>
                )}
                {action && (
                    <TouchableOpacity
                        onPress={action.onPress}
                        className="bg-blue-600 px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white font-medium">
                            {action.label}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
