import { Stack } from "expo-router";

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="about" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="product/index" />
      <Stack.Screen name="product/[id]/page" />
      <Stack.Screen name="testDevice/index" />
    </Stack>
  );
}
