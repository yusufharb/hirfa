/**
 * HIRFA Craftsman App — Active Job Screen
 * Shows job details and controls (start, complete, navigate to customer)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { bookingApi } from '../../src/services/api';
import type { Booking } from '../../../../shared/types';
import { BookingStatus, BOOKING_STATUS_LABELS_AR } from '../../../../shared/types';

const COLORS = {
  primary: '#1E3A5F',
  secondary: '#FF6B35',
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#DEE2E6',
};

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [finalPrice, setFinalPrice] = useState('');

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    if (!id) return;
    try {
      const res = await bookingApi.getBooking(id);
      if (res.data) setBooking(res.data);
    } catch (error) {
      Alert.alert('خطأ', 'تعذر تحميل بيانات الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartJob = async () => {
    if (!booking) return;
    Alert.alert(
      'بدء العمل',
      'هل وصلت إلى العميل وبدأت في العمل؟',
      [
        { text: 'لا', style: 'cancel' },
        {
          text: 'نعم، بدأت',
          onPress: async () => {
            setIsActionLoading(true);
            try {
              const res = await bookingApi.startJob(booking.id);
              if (res.data) setBooking(res.data);
            } catch {
              Alert.alert('خطأ', 'تعذر تحديث حالة الطلب');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCompleteJob = async () => {
    if (!booking) return;
    const price = parseFloat(finalPrice);
    if (isNaN(price) || price <= 0) {
      Alert.alert('تنبيه', 'أدخل السعر النهائي للعمل');
      return;
    }

    Alert.alert(
      'إتمام العمل',
      `هل أتممت العمل بسعر ${price} ج.م؟`,
      [
        { text: 'لا', style: 'cancel' },
        {
          text: 'نعم، اكتمل',
          onPress: async () => {
            setIsActionLoading(true);
            try {
              const res = await bookingApi.completeJob(booking.id, price);
              if (res.data) {
                setBooking(res.data);
                Alert.alert(
                  '🎉 ممتاز!',
                  `تم إتمام العمل بنجاح\nأرباحك: ${(price * 0.82).toFixed(0)} ج.م`,
                  [{ text: 'حسناً', onPress: () => router.back() }]
                );
              }
            } catch {
              Alert.alert('خطأ', 'تعذر إتمام الطلب');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCallCustomer = () => {
    if (booking?.customer?.phone) {
      Linking.openURL(`tel:${booking.customer.phone}`);
    }
  };

  const handleNavigate = () => {
    if (booking?.address?.lat && booking?.address?.lng) {
      const url = `https://maps.google.com/?q=${booking.address.lat},${booking.address.lng}`;
      Linking.openURL(url);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>لم يتم العثور على الطلب</Text>
      </View>
    );
  }

  const isInProgress = booking.status === BookingStatus.IN_PROGRESS;
  const isConfirmed = booking.status === BookingStatus.CONFIRMED || 
                      booking.status === BookingStatus.CRAFTSMAN_ON_WAY;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>→ رجوع</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تفاصيل الطلب</Text>
        </View>

        {/* Status Badge */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, getStatusStyle(booking.status)]}>
            <Text style={styles.statusText}>
              {BOOKING_STATUS_LABELS_AR[booking.status]}
            </Text>
          </View>
          <Text style={styles.bookingId}>رقم الطلب: #{booking.id.slice(0, 8)}</Text>
        </View>

        {/* Service Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔧 الخدمة</Text>
          <Text style={styles.serviceName}>
            {booking.serviceCategory?.nameAr || 'خدمة'}
          </Text>
          {booking.problemDescription && (
            <Text style={styles.problemDesc}>💬 {booking.problemDescription}</Text>
          )}
          <Text style={styles.priceEstimate}>
            💰 السعر التقديري: {booking.estimatedPrice || 'مفتوح'} ج.م
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 العميل</Text>
          <Text style={styles.customerName}>{booking.customer?.name || 'العميل'}</Text>
          <Text style={styles.customerPhone}>📞 {booking.customer?.phone}</Text>
          {booking.address && (
            <Text style={styles.address}>
              📍 {booking.address.addressLine1}, {booking.address.district}, {booking.address.city}
            </Text>
          )}
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.callBtn} onPress={handleCallCustomer}>
            <Text style={styles.callBtnText}>📞 اتصل بالعميل</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navBtn} onPress={handleNavigate}>
            <Text style={styles.navBtnText}>🗺️ الملاحة</Text>
          </TouchableOpacity>
        </View>

        {/* Job Progress Actions */}
        {(isConfirmed || isInProgress) && (
          <View style={styles.actionsSection}>
            {isConfirmed && (
              <TouchableOpacity
                style={styles.startBtn}
                onPress={handleStartJob}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startBtnText}>🚀 بدأت العمل</Text>
                )}
              </TouchableOpacity>
            )}

            {isInProgress && (
              <View>
                <Text style={styles.finalPriceLabel}>السعر النهائي (ج.م) *</Text>
                <View style={styles.priceInputRow}>
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={handleCompleteJob}
                    disabled={isActionLoading}
                  >
                    {isActionLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.completeBtnText}>✅ أتممت العمل</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <Text style={styles.earningsNote}>
                  * أرباحك = السعر النهائي × 82% (بعد عمولة حرفة 18%)
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusStyle(status: BookingStatus) {
  const styles: Record<string, object> = {
    [BookingStatus.PENDING]: { backgroundColor: '#FFF3CD' },
    [BookingStatus.CONFIRMED]: { backgroundColor: '#D1ECF1' },
    [BookingStatus.CRAFTSMAN_ON_WAY]: { backgroundColor: '#CCE5FF' },
    [BookingStatus.IN_PROGRESS]: { backgroundColor: '#D4EDDA' },
    [BookingStatus.COMPLETED]: { backgroundColor: '#D4EDDA' },
    [BookingStatus.CANCELLED]: { backgroundColor: '#F8D7DA' },
  };
  return styles[status] || { backgroundColor: '#E2E3E5' };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, fontFamily: 'Cairo_400Regular', color: COLORS.error },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  backBtn: { color: '#fff', fontSize: 16, fontFamily: 'Cairo_400Regular' },
  headerTitle: { color: '#fff', fontSize: 18, fontFamily: 'Cairo_700Bold' },
  statusSection: { alignItems: 'center', paddingVertical: 16 },
  statusBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 15, fontFamily: 'Cairo_600SemiBold', color: COLORS.text },
  bookingId: { marginTop: 6, fontSize: 12, color: COLORS.textSecondary, fontFamily: 'Cairo_400Regular' },
  card: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: { fontSize: 12, color: COLORS.textSecondary, fontFamily: 'Cairo_400Regular', marginBottom: 8 },
  serviceName: { fontSize: 20, fontFamily: 'Cairo_700Bold', color: COLORS.primary, marginBottom: 6 },
  problemDesc: { fontSize: 14, fontFamily: 'Cairo_400Regular', color: COLORS.text, marginBottom: 6 },
  priceEstimate: { fontSize: 15, fontFamily: 'Cairo_600SemiBold', color: COLORS.success },
  customerName: { fontSize: 18, fontFamily: 'Cairo_600SemiBold', color: COLORS.text, marginBottom: 4 },
  customerPhone: { fontSize: 14, fontFamily: 'Cairo_400Regular', color: COLORS.textSecondary, marginBottom: 6 },
  address: { fontSize: 13, fontFamily: 'Cairo_400Regular', color: COLORS.text },
  quickActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  callBtn: {
    flex: 1, backgroundColor: COLORS.primary,
    padding: 12, borderRadius: 10, alignItems: 'center',
  },
  callBtnText: { color: '#fff', fontFamily: 'Cairo_700Bold', fontSize: 14 },
  navBtn: {
    flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary,
    padding: 12, borderRadius: 10, alignItems: 'center',
  },
  navBtnText: { color: COLORS.primary, fontFamily: 'Cairo_700Bold', fontSize: 14 },
  actionsSection: { paddingHorizontal: 16, paddingBottom: 30 },
  startBtn: {
    backgroundColor: COLORS.secondary, padding: 16,
    borderRadius: 12, alignItems: 'center', marginBottom: 12,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Cairo_700Bold' },
  finalPriceLabel: { fontSize: 14, fontFamily: 'Cairo_600SemiBold', color: COLORS.text, marginBottom: 8 },
  priceInputRow: { gap: 10 },
  completeBtn: {
    backgroundColor: COLORS.success, padding: 16,
    borderRadius: 12, alignItems: 'center',
  },
  completeBtnText: { color: '#fff', fontSize: 17, fontFamily: 'Cairo_700Bold' },
  earningsNote: {
    marginTop: 8, fontSize: 12,
    fontFamily: 'Cairo_400Regular', color: COLORS.textSecondary, textAlign: 'center',
  },
});
