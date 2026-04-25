import {useState} from 'react';
// import { Text  } from '@react-navigation/elements';
import { Text, TextInput, TouchableOpacity, View } from "react-native";
// import { View } from 'react-native-reanimated/lib/typescript/Animated';
interface UserData {
    username?: string;
    password?: string;
}
export default function Register() {
    
    // const [name, setName] = useState('');
    const [data, setData] = useState<UserData>({});

    const handleUsernameChange = (text: string) => {
        setData({...data, username: text});
    };
    
    const handlePasswordChange = (text: string) => {
        setData({...data, password: text});
    };
    
    const handleSubmit = async () => {
        const {username, password} = data;
        const response = await fetch('http://localhost:3000/user/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, password})
        });
        const responseData = await response.json();
        console.log(responseData);
    };
    return (
        <View className='bg-gray-400 h-screen flex items-center justify-center'>
            <Text  className='p-5 m-3 text-center w-40 bg-indigo-700 text-white rounded'>Register</Text>
            <Text className="flex h-screen bg-indigo-700">
<Text className="w-full max-w-xs  bg-indigo-100 rounded p-5">   
      <header>
        <img className="w-20 mx-auto mb-5" src="https://img.icons8.com/fluent/344/year-of-tiger.png" />
      </header>   
      <Text>
        <Text>
          <label className="block mb-2 text-indigo-500" htmlFor="username">Username</label>
          <TextInput className="w-full p-2 mb-6 text-indigo-700 border-b-2 border-indigo-500 outline-none focus:bg-gray-300" value={data.username} onChangeText={(text) => setData({...data, username: text})} placeholder="Username" />
        </Text>
        <Text>
          <label className="block mb-2 text-indigo-500" htmlFor="password">Password</label>
          <TextInput className="w-full p-2 mb-6 text-indigo-700 border-b-2 border-indigo-500 outline-none focus:bg-gray-300" secureTextEntry onChangeText={(text) => setData({...data, password: text})} placeholder="Password" />
        </Text>
        <Text>          
          <TouchableOpacity activeOpacity={0.8} onPressOut={handleSubmit} className="w-full bg-indigo-700 py-2 px-4 mb-6 rounded" onPress={handleSubmit}>
            <Text className="text-white font-bold text-center">Submit</Text>
          </TouchableOpacity>
        </Text>       
      </Text>  
      <footer>
        <a className="text-indigo-700 hover:text-pink-700 text-sm float-left" href="#">htmlForgot Password?</a>
        <a className="text-indigo-700 hover:text-pink-700 text-sm float-right" href="#">Create Account</a>
      </footer>   
    </Text>
</Text>
        </View>


        
        );
}