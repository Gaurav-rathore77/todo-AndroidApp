import { Text, View } from "react-native";
import { Link } from 'expo-router';
import TodoItem from '../components/TodoItem';
export default function Index() {
  return (
    <View
     className=""
    >
       <Text className="flex justify-center  text-2xl mt-5 font-bold text-blue-500">Your todo</Text>
       <TodoItem />
       <Link href="/about">About</Link>
    </View>
  );
}
