import { Stack } from "expo-router";
import "../global.css";
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="screens/about" />
      <Stack.Screen name="screens/product/index" />
      <Stack.Screen name="screens/auth/login" />
      <Stack.Screen name="screens/auth/register" />
      <Stack.Screen name="screens/product/[id]/page" />
    </Stack>
  );
}
