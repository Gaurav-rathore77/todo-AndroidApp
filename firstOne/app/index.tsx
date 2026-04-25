import { Text, TouchableOpacity, View } from "react-native";
import { useState,useEffect } from "react";
import { ScrollView } from "react-native";

export default function Index() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);

  const increment = () => {
    setCount(count + 1);
  };
  const decrement = () => {
    setCount(count - 1);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const data = await response.json();
      setData(data);
    };
    fetchData();
  }, []);
  return (
     <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl text-center font-bold text-blue-500">
        Welcome to Nativewind!
        {count}
      </Text>
      <TouchableOpacity onPress={increment}>
        <Text>Increment</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={decrement}>
        <Text>Decrement</Text>
      </TouchableOpacity>
      <ScrollView className="flex-1">
        {data.map((items : any) => (
        <Text key={items.id}>{items.title}</Text>
      ))}
      </ScrollView>
    </View>
  );
}
