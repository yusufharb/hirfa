import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import OTPInput from '../../src/components/OTPInput';
import { useAuthStore } from '../../src/store/authStore';

export default function OTPScreen() {
  const { phone } = useLocalSearchParams();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const { setTokens, setUser } = useAuthStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = () => {
    if (code.length !== 6) return;
    
    // Simulate verification
    // if success:
    setTokens('mock-token', 'mock-refresh');
    
    // Simulate new user logic
    const isNewUser = true; 
    if (isNewUser) {
      router.push('/name');
    } else {
      setUser({ id: '1', name: 'User', phone: phone as string, role: 'customer' });
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تأكيد الرقم</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}</Text>
      
      <OTPInput length={6} value={code} onChange={setCode} />
      
      <TouchableOpacity 
        style={[styles.button, code.length !== 6 && styles.buttonDisabled]} 
        onPress={handleVerify}
        disabled={code.length !== 6}
      >
        <Text style={styles.buttonText}>Verify / تأكيد</Text>
      </TouchableOpacity>

      <TouchableOpacity disabled={timer > 0} onPress={() => setTimer(60)}>
        <Text style={[styles.resend, timer > 0 && styles.resendDisabled]}>
          {timer > 0 ? `Resend code in ${timer}s` : 'Resend Code / إعادة الإرسال'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resend: {
    marginTop: 24,
    color: COLORS.secondary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  resendDisabled: {
    color: COLORS.textSecondary,
  },
});