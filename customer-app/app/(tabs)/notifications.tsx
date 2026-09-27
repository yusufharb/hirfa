import { View, Text, StyleSheet, FlatList } from 'react-native';
import { COLORS } from '../../src/constants/colors';

export default function NotificationsScreen() {
  const notifications = [
    { id: '1', title: 'تم تأكيد الحجز', body: 'تم تأكيد حجزك لخدمة السباكة', time: 'منذ ساعتين' },
    { id: '2', title: 'عرض جديد', body: 'احصل على خصم 20% على خدمات النظافة', time: 'منذ يوم' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.primary,
    textAlign: 'right',
  },
});