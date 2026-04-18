import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";

interface Todo {
    _id: string;
    text: string;
    completed: boolean;
}

interface User {
    id: string;
    username: string;
    email: string;
}

export default function TodoItem() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [error, setError] = useState('');

    // Auth states
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const API_URL = 'http://localhost:3000/api';

    // Helper: API call with auth header
    const apiCall = async (endpoint: string, options: RequestInit = {}) => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...((options.headers as Record<string, string>) || {})
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        if (response.status === 401) {
            setToken(null);
            setUser(null);
            throw new Error('Session expired. Please login again.');
        }
        return response;
    };

    // ==================== AUTH FUNCTIONS ====================

    const handleRegister = async () => {
        if (!username || !email || !password) {
            setError('Please fill all fields');
            return;
        }
        setAuthLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            setToken(data.token);
            setUser(data.user);
            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        setAuthLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            setToken(data.token);
            setUser(data.user);
            setError('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setTodos([]);
    };

    // ==================== TODO FUNCTIONS ====================

    const fetchTodos = async () => {
        if (!token) return;
        try {
            setError('');
            const response = await apiCall('/todos');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setTodos(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    const addTodo = async () => {
        if (!newTodoText.trim() || !token) return;
        try {
            const response = await apiCall('/todos', {
                method: 'POST',
                body: JSON.stringify({ text: newTodoText })
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add');
            }
            const todo = await response.json();
            setTodos([todo, ...todos]);
            setNewTodoText('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const toggleTodo = async (id: string, completed: boolean) => {
        try {
            const response = await apiCall(`/todos/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ completed: !completed })
            });
            if (!response.ok) throw new Error('Failed to update');
            const updated = await response.json();
            setTodos(todos.map(t => t._id === id ? updated : t));
        } catch (err) {
            console.error('Update error:', err);
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            const response = await apiCall(`/todos/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            setTodos(todos.filter(t => t._id !== id));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTodos();
        }
    }, [token]);

    // ==================== AUTH SCREEN ====================
    if (!token) {
        return (
            <ScrollView className="flex-1 bg-gray-100">
                <View className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-16 m-4">
                    <View className="px-4 py-4 bg-gray-800">
                        <Text className="text-white font-bold text-2xl uppercase text-center">
                            {isLogin ? 'Login' : 'Register'}
                        </Text>
                    </View>

                    {error ? (
                        <View className="px-4 py-2 bg-red-100 m-4 rounded">
                            <Text className="text-red-600 text-center text-sm">{error}</Text>
                        </View>
                    ) : null}

                    <View className="px-4 py-4">
                        {!isLogin && (
                            <TextInput
                                className="border border-gray-300 rounded px-3 py-2 mb-3"
                                placeholder="Username"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        )}
                        <TextInput
                            className="border border-gray-300 rounded px-3 py-2 mb-3"
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            className="border border-gray-300 rounded px-3 py-2 mb-4"
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            onPress={isLogin ? handleLogin : handleRegister}
                            disabled={authLoading}
                            className={`${authLoading ? 'bg-gray-400' : 'bg-teal-500'} py-3 rounded mb-3`}
                        >
                            <Text className="text-white font-bold text-center">
                                {authLoading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setIsLogin(!isLogin); setError(''); }}>
                            <Text className="text-teal-500 text-center">
                                {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    // ==================== TODO SCREEN ====================
    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-16 m-4">
                <View className="px-4 py-4 bg-gray-800">
                    <Text className="text-white font-bold text-2xl uppercase text-center">To-Do List</Text>
                    <Text className="text-gray-300 text-center text-sm mt-1">Welcome, {user?.username}!</Text>
                </View>

                {error ? (
                    <View className="px-4 py-2 bg-red-100">
                        <Text className="text-red-600 text-center text-sm">{error}</Text>
                    </View>
                ) : null}

                <View className="w-full px-4 py-4">
                    <View className="flex flex-row items-center border-b-2 border-teal-500 py-2">
                        <TextInput
                            className="flex-1 text-gray-700 px-2 py-1"
                            placeholder="Add a task"
                            value={newTodoText}
                            onChangeText={setNewTodoText}
                            onSubmitEditing={addTodo}
                        />
                        <TouchableOpacity
                            onPress={addTodo}
                            className="bg-teal-500 px-4 py-2 rounded ml-2"
                        >
                            <Text className="text-white font-bold">Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="px-4 pb-4">
                    {todos.length === 0 ? (
                        <Text className="text-gray-500 text-center py-4">No todos yet. Add one above!</Text>
                    ) : (
                        todos.map((todo) => (
                            <View key={todo._id} className="py-3 border-b border-gray-200 flex flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => toggleTodo(todo._id, todo.completed)}
                                    className="mr-3"
                                >
                                    <View className={`w-5 h-5 border-2 rounded ${
                                        todo.completed ? 'bg-teal-500 border-teal-500' : 'border-gray-400'
                                    }`}>
                                        {todo.completed ? (
                                            <Text className="text-white text-xs text-center">✓</Text>
                                        ) : null}
                                    </View>
                                </TouchableOpacity>
                                <View className="flex-1">
                                    <Text className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                        {todo.text}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => deleteTodo(todo._id)}
                                    className="ml-2"
                                >
                                    <Text className="text-red-500 font-bold">✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>

                <View className="px-4 py-3 bg-gray-100">
                    <TouchableOpacity onPress={logout} className="border border-red-500 py-2 rounded">
                        <Text className="text-red-500 text-center font-bold">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}


