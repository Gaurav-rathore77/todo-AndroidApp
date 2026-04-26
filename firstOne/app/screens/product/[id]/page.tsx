import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
export default function ProductId() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    return (
        <View>
            <Text>Product Id: {id}</Text>
        </View>
    );
}
 