import { Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect } from "react";

interface Todo {
    _id: string;
    text: string;
    completed: boolean;
}

export default function TodoItem() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [error, setError] = useState('');

    const API_URL = 'http://localhost:3000/api/todos';

    const fetchTodos = async () => {
        try {
            setError('');
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setTodos(data);
        } catch (err) {
            setError('Server not running. Please start: cd backend && npm start');
            console.error('Fetch error:', err);
        }
    };

    const addTodo = async () => {
        if (!newTodoText.trim()) return;
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newTodoText })
            });
            if (!response.ok) throw new Error('Failed to add');
            const todo = await response.json();
            setTodos([todo, ...todos]);
            setNewTodoText('');
        } catch (err) {
            setError('Failed to add todo');
            console.error('Add error:', err);
        }
    };

    const toggleTodo = async (id: string, completed: boolean) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
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
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete');
            setTodos(todos.filter(t => t._id !== id));
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <ScrollView className="flex-1 bg-gray-100">
            <View className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-16 m-4">
                {/* Title */}
                <View className="px-4 py-4 bg-gray-800">
                    <Text className="text-white font-bold text-2xl uppercase text-center">To-Do List</Text>
                </View>

                {/* Error Message */}
                {error ? (
                    <View className="px-4 py-2 bg-red-100">
                        <Text className="text-red-600 text-center text-sm">{error}</Text>
                    </View>
                ) : null}

                {/* Input Section */}
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

                {/* Todo List */}
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
            </View>
        </ScrollView>
    );
}


