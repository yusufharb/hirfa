/**
 * HIRFA Craftsman App — Home Screen (الرئيسية)
 * Shows availability toggle, incoming job requests, and earnings summary
 */

import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../src/store/authStore';
import { useJobsStore } from '../../src/store/jobsStore';
import { craftsmanApi } from '../../src/services/api';
import type { NewJobRequestEvent, BookingStatusChangedEvent } from '../../../../shared/types';

// HIRFA brand colors
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

export default function HomeScreen() {
  const { user, accessToken, fcmToken } = useAuthStore();
  const {
    pendingRequests,
    activeJob,
    earningsToday,
    earningsThisMonth,
    walletBalance,
    addJobRequest,
    removeJobRequest,
    setActiveJob,
    setEarnings,
  } = useJobsStore();

  const [isAvailable, setIsAvailable] = React.useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const socketRef = useRef<Socket | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load initial data ──────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [profileRes, earningsRes] = await Promise.all([
        craftsmanApi.getProfile(),
        craftsmanApi.getEarnings(),
      ]);
      if (profileRes.data) {
        setIsAvailable(profileRes.data.isAvailable);
      }
      if (earningsRes.data) {
        setEarnings(
          earningsRes.data.today,
          earningsRes.data.thisMonth,
          earningsRes.data.walletBalance
        );
      }
    } catch (error) {
      console.error('Failed to load craftsman data:', error);
    }
  }, [setEarnings]);

  // ── Socket.io connection ───────────────────────────────────
  useEffect(() => {
    if (!accessToken || !user?.id) return;

    const socket = io(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      // Join craftsman's personal room for job requests
      socket.emit('join_craftsman_room', { craftsmanId: user.id });
    });

    // New job request received!
    socket.on('new_job_request', (event: NewJobRequestEvent) => {
      console.log('New job request:', event.bookingId);
      // Vibrate device to alert craftsman
      Vibration.vibrate(Platform.OS === 'android' ? [0, 400, 100, 400] : [0, 400]);
      addJobRequest(event);
    });

    // Booking status changed (e.g., customer cancelled)
    socket.on('booking_status_changed', (event: BookingStatusChangedEvent) => {
      if (event.status === 'cancelled') {
        removeJobRequest(event.bookingId);
        if (activeJob?.id === event.bookingId) {
          setActiveJob(null);
          Alert.alert('إلغاء الحجز', 'قام العميل بإلغاء الحجز');
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, user?.id]);

  // ── Live location updates when available ──────────────────
  useEffect(() => {
    if (!isAvailable) {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      return;
    }

    const startLocationUpdates = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      // Send location every 30 seconds when available
      locationIntervalRef.current = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          await craftsmanApi.updateLocation(
            loc.coords.latitude,
            loc.coords.longitude
          );
        } catch (error) {
          console.error('Location update failed:', error);
        }
      }, 30000);
    };

    startLocationUpdates();

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
    };
  }, [isAvailable]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Toggle availability ────────────────────────────────────
  const handleAvailabilityToggle = async (value: boolean) => {
    setIsTogglingAvailability(true);
    try {
      await craftsmanApi.setAvailability(value);
      setIsAvailable(value);
    } catch {
      Alert.alert('خطأ', 'فشل في تحديث حالة التوفر');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  // ── Accept job request ─────────────────────────────────────
  const handleAcceptJob = async (bookingId: string) => {
    try {
      const res = await craftsmanApi.getEarnings(); // refresh earnings
      removeJobRequest(bookingId);
      router.push(`/job/${bookingId}`);
    } catch {
      Alert.alert('خطأ', 'تعذر قبول الطلب. ربما قبله حرفي آخر.');
      removeJobRequest(bookingId);
    }
  };

  // ── Decline job request ────────────────────────────────────
  const handleDeclineJob = (bookingId: string) => {
    removeJobRequest(bookingId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>أهلاً، {user?.name || 'الحرفي'}</Text>
            <Text style={styles.subtitle}>مرحباً بك في حرفة 👷</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'H'}
            </Text>
          </View>
        </View>

        {/* ── Availability Toggle ──────────────────── */}
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityInfo}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isAvailable ? COLORS.success : COLORS.error },
              ]}
            />
            <View>
              <Text style={styles.availabilityTitle}>
                {isAvailable ? '✅ أنت متاح الآن' : '⏸️ أنت غير متاح'}
              </Text>
              <Text style={styles.availabilitySubtitle}>
                {isAvailable
                  ? 'ستصلك طلبات عمل من العملاء'
                  : 'لن تصلك أي طلبات عمل'}
              </Text>
            </View>
          </View>
          {isTogglingAvailability ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Switch
              value={isAvailable}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: COLORS.border, true: '#90EE90' }}
              thumbColor={isAvailable ? COLORS.success : COLORS.textSecondary}
              ios_backgroundColor={COLORS.border}
            />
          )}
        </View>

        {/* ── Earnings Summary ─────────────────────── */}
        <View style={styles.earningsRow}>
          <View style={[styles.earningsCard, { borderLeftColor: COLORS.secondary }]}>
            <Text style={styles.earningsAmount}>{earningsToday.toFixed(0)} ج.م</Text>
            <Text style={styles.earningsLabel}>أرباح اليوم</Text>
          </View>
          <View style={[styles.earningsCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.earningsAmount}>{earningsThisMonth.toFixed(0)} ج.م</Text>
            <Text style={styles.earningsLabel}>أرباح الشهر</Text>
          </View>
          <View style={[styles.earningsCard, { borderLeftColor: COLORS.success }]}>
            <Text style={styles.earningsAmount}>{walletBalance.toFixed(0)} ج.م</Text>
            <Text style={styles.earningsLabel}>رصيد المحفظة</Text>
          </View>
        </View>

        {/* ── Active Job Banner ────────────────────── */}
        {activeJob && (
          <TouchableOpacity
            style={styles.activeJobBanner}
            onPress={() => router.push(`/job/${activeJob.id}`)}
          >
            <Text style={styles.activeJobTitle}>🔧 لديك شغل نشط</Text>
            <Text style={styles.activeJobSubtitle}>
              {activeJob.serviceCategory?.nameAr} — اضغط للتفاصيل
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Incoming Job Requests ────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            طلبات عمل واردة{' '}
            {pendingRequests.length > 0 && (
              <Text style={styles.badge}>({pendingRequests.length})</Text>
            )}
          </Text>

          {pendingRequests.length === 0 ? (
            <View style={styles.emptyRequests}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>
                {isAvailable
                  ? 'لا توجد طلبات جديدة الآن\nسيتم إشعارك فور وصول طلب'
                  : 'فعّل حالة التوفر لاستقبال الطلبات'}
              </Text>
            </View>
          ) : (
            pendingRequests.map((request) => (
              <JobRequestCard
                key={request.bookingId}
                request={request}
                onAccept={() => handleAcceptJob(request.bookingId)}
                onDecline={() => handleDeclineJob(request.bookingId)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Job Request Card Component
// ─────────────────────────────────────────────

interface JobRequestCardProps {
  request: NewJobRequestEvent;
  onAccept: () => void;
  onDecline: () => void;
}

function JobRequestCard({ request, onAccept, onDecline }: JobRequestCardProps) {
  const [timeLeft, setTimeLeft] = React.useState(120); // 2 minutes to decide

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(); // auto-decline when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const urgencyColor = timeLeft < 30 ? COLORS.error : timeLeft < 60 ? COLORS.warning : COLORS.success;

  return (
    <View style={styles.requestCard}>
      {/* Timer */}
      <View style={[styles.timerBadge, { backgroundColor: urgencyColor }]}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      {/* Service info */}
      <Text style={styles.requestService}>{request.serviceCategory.nameAr}</Text>
      <Text style={styles.requestAddress}>
        📍 {request.address.district}, {request.address.city} — {request.distanceKm.toFixed(1)} كم
      </Text>

      {request.problemDescription && (
        <Text style={styles.requestDescription} numberOfLines={2}>
          💬 {request.problemDescription}
        </Text>
      )}

      <View style={styles.requestMeta}>
        <Text style={styles.requestPrice}>
          💰 {request.estimatedPrice ? `${request.estimatedPrice} ج.م` : 'سعر مفتوح'}
        </Text>
        <Text style={styles.requestSchedule}>
          {request.scheduledType === 'now' ? '⚡ فوري' : `📅 ${request.scheduledAt}`}
        </Text>
      </View>

      {/* Action buttons */}
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={onAccept}
        >
          <Text style={styles.acceptBtnText}>✅ اقبل الطلب</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.declineBtn]}
          onPress={onDecline}
        >
          <Text style={styles.declineBtnText}>❌ رفض</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 22,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },
  availabilityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  availabilityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  availabilityTitle: {
    fontSize: 16,
    fontFamily: 'Cairo_600SemiBold',
    color: COLORS.text,
  },
  availabilitySubtitle: {
    fontSize: 12,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
  },
  earningsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  earningsCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 1,
  },
  earningsAmount: {
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  earningsLabel: {
    fontSize: 11,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  activeJobBanner: {
    backgroundColor: COLORS.secondary,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 10,
  },
  activeJobTitle: {
    fontSize: 16,
    fontFamily: 'Cairo_700Bold',
    color: '#FFFFFF',
  },
  activeJobSubtitle: {
    fontSize: 13,
    fontFamily: 'Cairo_400Regular',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  badge: {
    color: COLORS.secondary,
  },
  emptyRequests: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  timerText: {
    color: '#FFFFFF',
    fontFamily: 'Cairo_700Bold',
    fontSize: 14,
  },
  requestService: {
    fontSize: 20,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  requestAddress: {
    fontSize: 14,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  requestDescription: {
    fontSize: 13,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.text,
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
  },
  requestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  requestPrice: {
    fontSize: 16,
    fontFamily: 'Cairo_700Bold',
    color: COLORS.success,
  },
  requestSchedule: {
    fontSize: 13,
    fontFamily: 'Cairo_400Regular',
    color: COLORS.textSecondary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
    flex: 2,
  },
  declineBtn: {
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontFamily: 'Cairo_700Bold',
    fontSize: 15,
  },
  declineBtnText: {
    color: COLORS.error,
    fontFamily: 'Cairo_600SemiBold',
    fontSize: 14,
  },
});
