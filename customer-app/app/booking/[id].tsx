import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import StarRating from '../../src/components/StarRating';

export default function BookingTrackingScreen() {
  const { id } = useLocalSearchParams();
  const status = 'on_the_way'; // Mock status

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>خريطة التتبع</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>حالة الطلب</Text>
          <Text style={styles.statusText}>الفني في الطريق إليك</Text>

          <View style={styles.craftsmanCard}>
            <View style={styles.avatarPlaceholder} />
            <View style={styles.craftsmanInfo}>
              <Text style={styles.craftsmanName}>أحمد محمد</Text>
              <Text style={styles.craftsmanDetails}>سباك • 4.8 ⭐️</Text>
            </View>
          </View>

          {status === 'completed' && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>قيّم تجربتك</Text>
              <StarRating rating={0} onRatingChange={() => {}} />
            </View>
          )}
        </View>
      </ScrollView>

      {status !== 'completed' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>إلغاء الطلب</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapPlaceholder: {
    height: 300,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    color: COLORS.textSecondary,
    fontSize: 18,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  statusText: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'right',
  },
  craftsmanCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.border,
    marginLeft: 16,
  },
  craftsmanInfo: {
    flex: 1,
  },
  craftsmanName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  craftsmanDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  ratingSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
});