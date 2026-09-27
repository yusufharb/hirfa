import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = () => {
    // Validate Egyptian phone number (e.g., 010, 011, 012, 015 + 8 digits)
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid Egyptian phone number');
      return;
    }
    
    // Simulate API call to send OTP
    // authApi.sendOtp(phone);
    
    // Pass phone to next screen
    router.push({ pathname: '/otp', params: { phone } });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>أدخل رقم هاتفك</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue</Text>
      
      <View style={styles.inputContainer}>
        <View style={styles.prefixContainer}>
          <Text style={styles.prefix}>+20</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="01xxxxxxxxx"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            setError('');
          }}
          maxLength={11}
        />
      </View>
      
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Continue / متابعة</Text>
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
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  prefixContainer: {
    backgroundColor: '#F1F3F5',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 18,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: COLORS.error,
    marginBottom: 16,
    textAlign: 'center',
  },
});