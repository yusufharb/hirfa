import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function AddAddressScreen() {
  const [label, setLabel] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>إضافة عنوان جديد</Text>

      <View style={styles.form}>
        <Text style={styles.label}>اسم العنوان (منزل، عمل...)</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          textAlign="right"
        />

        <Text style={styles.label}>تفاصيل العنوان</Text>
        <TextInput
          style={styles.input}
          value={addressLine}
          onChangeText={setAddressLine}
          textAlign="right"
        />

        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationButtonText}>📍 استخدم موقعي الحالي</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
        <Text style={styles.saveButtonText}>حفظ العنوان</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 24,
    textAlign: 'right',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  locationButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    marginTop: 8,
  },
  locationButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});