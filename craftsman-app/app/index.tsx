import Anthropic from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Redirect } from 'expo-router';

/**
 * Craftsman App Root Index
 * Redirects to home if authenticated, otherwise to auth/login
 */
export default function Index() {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/phone" />;
}
