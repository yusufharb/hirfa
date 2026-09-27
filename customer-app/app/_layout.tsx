import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const loadInitialState = useAuthStore((state) => state.loadInitialState);

  useEffect(() => {
    loadInitialState();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="booking/create" />
      <Stack.Screen name="booking/[id]" />
      <Stack.Screen name="address/add" />
    </Stack>
  );
}