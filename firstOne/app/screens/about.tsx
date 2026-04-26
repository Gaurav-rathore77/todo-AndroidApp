import { useRouter } from "expo-router";
import { Button } from "react-native";
export default function About() {
    const router = useRouter();
    return (
        <div>
            <h1>About</h1>
            <Button title="Go to Home" onPress={() => router.push("/")} />
        </div>
    );
}