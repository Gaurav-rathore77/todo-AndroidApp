import { Stack } from 'expo-router';

export default function FollowUpsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Follow-ups',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
