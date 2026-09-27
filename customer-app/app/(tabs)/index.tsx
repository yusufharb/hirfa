import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import ServiceCard from '../../src/components/ServiceCard';
import BookingCard from '../../src/components/BookingCard';
import { useAuthStore } from '../../src/store/authStore';

const CATEGORIES = [
  { id: '1', name: 'سباكة', icon: '🚰', price: '150-300 ج' },
  { id: '2', name: 'كهرباء', icon: '⚡', price: '100-250 ج' },
  { id: '3', name: 'نجارة', icon: '🔨', price: '200-500 ج' },
  { id: '4', name: 'نظافة', icon: '🧹', price: '300-600 ج' },
  { id: '5', name: 'تكييف', icon: '❄️', price: '250-450 ج' },
  { id: '6', name: 'نقاشة', icon: '🎨', price: 'يبدأ من 500 ج' },
];

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcome}>مرحباً {user?.name || 'ضيف'}</Text>
        <Text style={styles.location}>📍 القاهرة، مصر</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن خدمة..."
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <View style={styles.promoBanner}>
        <Text style={styles.promoText}>أول حجز مجاني! 🎉</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الخدمات</Text>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <ServiceCard
              key={cat.id}
              icon={cat.icon}
              name={cat.name}
              price={cat.price}
              onPress={() => router.push(`/service/${cat.id}`)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>آخر الحجوزات</Text>
        <BookingCard
          serviceName="إصلاح تسريب مياه"
          date="2023-10-25"
          status="completed"
          craftsmanName="أحمد محمد"
          price={200}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: COLORS.surface,
    opacity: 0.8,
  },
  searchContainer: {
    padding: 16,
    marginTop: -24,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    textAlign: 'right',
  },
  promoBanner: {
    backgroundColor: COLORS.secondary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  promoText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});