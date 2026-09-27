import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../../src/constants/colors';
import BookingCard from '../../src/components/BookingCard';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('active');

  const mockBookings = [
    { id: '1', service: 'سباكة', status: 'in_progress', date: 'اليوم', craftsman: 'أحمد', price: 150 },
    { id: '2', service: 'كهرباء', status: 'completed', date: 'أمس', craftsman: 'محمود', price: 200 },
  ];

  const filteredBookings = mockBookings.filter(b => 
    activeTab === 'active' ? b.status !== 'completed' : b.status === 'completed'
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>الحالية</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'past' && styles.activeTab]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>السابقة</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingCard
            serviceName={item.service}
            date={item.date}
            status={item.status}
            craftsmanName={item.craftsman}
            price={item.price}
          />
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
  tabs: {
    flexDirection: 'row-reverse',
    backgroundColor: COLORS.surface,
    padding: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: COLORS.surface,
  },
  list: {
    padding: 16,
  },
});