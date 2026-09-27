import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

interface Props {
  serviceName: string;
  date: string;
  status: string;
  craftsmanName?: string;
  price?: number;
}

export default function BookingCard({ serviceName, date, status, craftsmanName, price }: Props) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.warning;
      default: return COLORS.primary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed': return 'مكتمل';
      case 'in_progress': return 'قيد التنفيذ';
      default: return 'جاري البحث';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.badgeText}>{getStatusText()}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.serviceName}>{serviceName}</Text>
        {craftsmanName && <Text style={styles.details}>الفني: {craftsmanName}</Text>}
        {price && <Text style={styles.price}>{price} ج</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  date: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  body: {
    alignItems: 'flex-end',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});