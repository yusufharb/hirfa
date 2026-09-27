import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';

export default function CreateBookingScreen() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
    else {
      // Submit booking
      router.replace('/booking/123'); // Redirect to tracking
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.label}>وصف المشكلة</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="اكتب تفاصيل المشكلة هنا..."
              textAlign="right"
            />
          </View>
        );
      case 2:
        return (
          <View>
            <Text style={styles.label}>اختر العنوان</Text>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardTitle}>المنزل</Text>
              <Text style={styles.cardText}>شارع 10، المعادي</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/address/add')}>
              <Text style={styles.addButtonText}>+ إضافة عنوان جديد</Text>
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.label}>الموعد</Text>
            <TouchableOpacity style={styles.cardActive}>
              <Text style={styles.cardTitle}>الآن</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardTitle}>تحديد موعد لاحق</Text>
            </TouchableOpacity>
          </View>
        );
      case 4:
        return (
          <View>
            <Text style={styles.label}>طريقة الدفع</Text>
            <TouchableOpacity style={styles.cardActive}>
              <Text style={styles.cardTitle}>كاش</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card}>
              <Text style={styles.cardTitle}>فوري</Text>
            </TouchableOpacity>
          </View>
        );
      case 5:
        return (
          <View>
            <Text style={styles.label}>ملخص الحجز</Text>
            <Text style={styles.summaryText}>الخدمة: سباكة</Text>
            <Text style={styles.summaryText}>الموعد: الآن</Text>
            <Text style={styles.summaryText}>الدفع: كاش</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>خطوة {step} من 5</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(step - 1)}>
            <Text style={styles.backButtonText}>رجوع</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{step === 5 ? 'تأكيد الحجز' : 'التالي'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  progressText: {
    textAlign: 'right',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    flexDirection: 'row-reverse',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardActive: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  addButton: {
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row-reverse',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  nextButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginLeft: 8,
  },
  backButtonText: {
    color: COLORS.text,
    fontSize: 16,
  },
});