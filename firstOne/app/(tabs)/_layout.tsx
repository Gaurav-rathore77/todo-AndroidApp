import { Tabs } from "expo-router";
import { useUserStore } from "../store/user";
import { Text, View } from "react-native";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View className={`items-center justify-center ${focused ? "opacity-100" : "opacity-60"}`}>
      <Text className="text-2xl">{icon}</Text>
    </View>
  );
}

export default function TabLayout() {
  const user = useUserStore((s) => s.user);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin",
          tabBarLabel: "Admin",
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
          href: user ? undefined : null,
        }}
      />
    </Tabs>
  );
}
