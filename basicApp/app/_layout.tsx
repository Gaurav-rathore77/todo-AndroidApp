import { Stack, useRouter, useSegments, Href } from "expo-router";
import { useEffect } from "react";
import "../global.css";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(app)";

    if (isAuthenticated && !inAuthGroup) {
      router.replace("/(app)" as Href);
    } else if (!isAuthenticated && inAuthGroup) {
      router.replace("/login");
    }
  }, [isAuthenticated, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
