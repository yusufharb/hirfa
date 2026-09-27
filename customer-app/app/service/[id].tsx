import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import CraftsmanCard from '../../src/components/CraftsmanCard';
import { useBookingStore } from '../../src/store/bookingStore';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { setSelectedService } = useBookingStore();

  const handleBookNow = () => {
    setSelectedService({ id, name: 'Service Name' });
    router.push('/booking/create');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>تفاصيل الخدمة</Text>
          <Text style={styles.description}>
            نقدم لك أفضل الفنيين المتخصصين في هذا المجال. سيتم تحديد السعر النهائي بعد المعاينة.
          </Text>
          <Text style={styles.price}>التكلفة المتوقعة: 150 - 300 ج</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>أفضل الفنيين بالقرب منك</Text>
          <CraftsmanCard name="أحمد محمد" rating={4.8} experience={5} distance={2.5} />
          <CraftsmanCard name="محمود علي" rating={4.5} experience={3} distance={4.1} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>احجز الآن</Text>
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
  header: {
    padding: 24,
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'right',
    lineHeight: 24,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  bookButton: {
    backgroundColor: COLORS.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});