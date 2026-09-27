/**
 * HIRFA Craftsman App — Main Application Entry
 * Built with Expo SDK 51 + TypeScript
 */

import 'expo-dev-client';
import { useEffect } from 'react';
import { I18nManager, StatusBar } from 'react-native';
import { Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold } from '@expo-google-fonts/cairo';
import { useAuthStore } from '../src/store/authStore';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Enable RTL for Arabic layout
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Notification handler: show alerts even when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_600SemiBold,
    Cairo_700Bold,
  });
  const { loadStoredAuth } = useAuthStore();

  useEffect(() => {
    // Load stored auth tokens from SecureStore on app start
    loadStoredAuth().finally(() => {
      if (fontsLoaded) {
        SplashScreen.hideAsync();
      }
    });
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#1E3A5F" />
      <Slot />
    </GestureHandlerRootView>
  );
}
