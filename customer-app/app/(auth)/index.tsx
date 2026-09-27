import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>HIRFA</Text>
        <Text style={styles.tagline}>كل حرفة في إيدك</Text>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/phone')}>
          <Text style={styles.buttonText}>Get Started / ابدأ الآن</Text>
        </TouchableOpacity>
        <Link href="/phone" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Login / تسجيل الدخول</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 24,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 32,
  },
  button: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    alignItems: 'center',
    padding: 8,
  },
  linkText: {
    color: COLORS.surface,
    fontSize: 16,
    textAlign: 'center',
  },
});