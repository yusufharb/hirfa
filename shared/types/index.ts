/**
 * HIRFA Shared Types
 * Shared TypeScript types used across backend, customer-app, craftsman-app, and admin-dashboard
 */

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

export enum UserRole {
  CUSTOMER = 'customer',
  CRAFTSMAN = 'craftsman',
  ADMIN = 'admin',
}

export enum BookingStatus {
  PENDING = 'pending',
  SEARCHING = 'searching',
  CONFIRMED = 'confirmed',
  CRAFTSMAN_ON_WAY = 'craftsman_on_way',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum ScheduleType {
  NOW = 'now',
  SCHEDULED = 'scheduled',
}

export enum PaymentMethod {
  CASH = 'cash',
  FAWRY = 'fawry',
  VODAFONE_CASH = 'vodafone_cash',
  CREDIT_CARD = 'credit_card',
  WALLET = 'wallet',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum OtpPurpose {
  LOGIN = 'login',
  REGISTER = 'register',
  RESET = 'reset',
}

// ─────────────────────────────────────────────
// CORE MODELS
// ─────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  profilePhotoUrl: string | null;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CraftsmanProfile {
  id: string;
  userId: string;
  bio: string | null;
  yearsExperience: number;
  serviceAreaKm: number;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  totalJobs: number;
  nationalIdNumber: string | null;
  nationalIdVerified: boolean;
  bankAccountNumber: string | null;
  bankName: string | null;
  walletBalance: number;
  lat: number | null;
  lng: number | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  user?: User;
  skills?: CraftsmanSkill[];
}

export interface CraftsmanSkill {
  id: string;
  craftsmanId: string;
  serviceCategoryId: string;
  yearsInSkill: number;
  isPrimary: boolean;
  serviceCategory?: ServiceCategory;
}

export interface ServiceCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  iconUrl: string | null;
  basePriceMin: number;
  basePriceMax: number;
  descriptionAr: string | null;
  descriptionEn: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string | null;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  craftsmanId: string | null;
  serviceCategoryId: string;
  addressId: string;
  status: BookingStatus;
  scheduledType: ScheduleType;
  scheduledAt: string | null;
  problemDescription: string | null;
  customerNotes: string | null;
  estimatedPrice: number | null;
  finalPrice: number | null;
  platformFee: number | null;
  craftsmanEarnings: number | null;
  cancellationReason: string | null;
  cancelledBy: 'customer' | 'craftsman' | 'system' | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  customer?: User;
  craftsman?: User;
  craftsmanProfile?: CraftsmanProfile;
  serviceCategory?: ServiceCategory;
  address?: Address;
  payment?: Payment;
  review?: Review;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number | null;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  fawryReferenceNumber: string | null;
  fawryMerchantRef: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  isPublic: boolean;
  createdAt: string;
  reviewer?: User;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

// ─────────────────────────────────────────────
// API REQUEST / RESPONSE TYPES
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth
export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  code: string;
  name?: string;
  role?: UserRole;
  fcmToken?: string; // Firebase Cloud Messaging token for push notifications
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

// Booking creation
export interface CreateBookingRequest {
  serviceCategoryId: string;
  addressId: string;
  scheduledType: ScheduleType;
  scheduledAt?: string; // ISO date string, required if scheduledType = 'scheduled'
  problemDescription?: string;
  customerNotes?: string;
  paymentMethod: PaymentMethod;
  estimatedPrice?: number;
}

// Craftsman profile update
export interface UpdateCraftsmanProfileRequest {
  bio?: string;
  yearsExperience?: number;
  serviceAreaKm?: number;
  skills?: Array<{
    serviceCategoryId: string;
    yearsInSkill: number;
    isPrimary: boolean;
  }>;
}

// Address creation
export interface CreateAddressRequest {
  label: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district?: string;
  lat?: number;
  lng?: number;
  isDefault?: boolean;
}

// Rating a booking
export interface RateBookingRequest {
  rating: number; // 1-5
  comment?: string;
}

// ─────────────────────────────────────────────
// DASHBOARD / ADMIN TYPES
// ─────────────────────────────────────────────

export interface DashboardStats {
  totalBookingsToday: number;
  totalBookingsThisMonth: number;
  revenueToday: number;
  revenueThisMonth: number;
  activeCraftsmen: number;
  newCustomersThisWeek: number;
  completionRate: number; // percentage
  averageRating: number;
  pendingVerifications: number;
}

export interface RevenueDataPoint {
  date: string;
  bookings: number;
  revenue: number;
}

// ─────────────────────────────────────────────
// SOCKET.IO EVENT TYPES
// ─────────────────────────────────────────────

export interface NewJobRequestEvent {
  bookingId: string;
  serviceCategory: ServiceCategory;
  address: Address;
  estimatedPrice: number | null;
  scheduledType: ScheduleType;
  scheduledAt: string | null;
  problemDescription: string | null;
  distanceKm: number;
}

export interface BookingStatusChangedEvent {
  bookingId: string;
  status: BookingStatus;
  craftsman?: Pick<User, 'id' | 'name' | 'phone' | 'profilePhotoUrl'>;
  craftsmanLocation?: { lat: number; lng: number };
  message: string;
}

export interface CraftsmanLocationEvent {
  bookingId: string;
  lat: number;
  lng: number;
  estimatedArrivalMinutes?: number;
}

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────

/** The 10 HIRFA service categories with emojis for display */
export const HIRFA_SERVICES = [
  { emoji: '🔧', nameAr: 'سباكة', nameEn: 'Plumbing', minPrice: 200, maxPrice: 800 },
  { emoji: '⚡', nameAr: 'كهرباء', nameEn: 'Electrical', minPrice: 150, maxPrice: 600 },
  { emoji: '🎨', nameAr: 'دهانات', nameEn: 'Painting', minPrice: 300, maxPrice: 2000 },
  { emoji: '❄️', nameAr: 'تكييف', nameEn: 'AC Service', minPrice: 250, maxPrice: 1000 },
  { emoji: '🪟', nameAr: 'نجارة', nameEn: 'Carpentry', minPrice: 200, maxPrice: 1500 },
  { emoji: '🧹', nameAr: 'تنظيف', nameEn: 'Cleaning', minPrice: 300, maxPrice: 800 },
  { emoji: '🏠', nameAr: 'صيانة عامة', nameEn: 'General Maintenance', minPrice: 150, maxPrice: 500 },
  { emoji: '🚿', nameAr: 'تجديد حمامات', nameEn: 'Bathroom Renovation', minPrice: 1000, maxPrice: 8000 },
  { emoji: '🔌', nameAr: 'أجهزة منزلية', nameEn: 'Appliance Repair', minPrice: 150, maxPrice: 600 },
  { emoji: '🚛', nameAr: 'نقل عفش', nameEn: 'Moving', minPrice: 500, maxPrice: 3000 },
] as const;

/** Booking status display labels in Arabic */
export const BOOKING_STATUS_LABELS_AR: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: 'في الانتظار',
  [BookingStatus.SEARCHING]: 'نبحث عن حرفي',
  [BookingStatus.CONFIRMED]: 'تم التأكيد',
  [BookingStatus.CRAFTSMAN_ON_WAY]: 'الحرفي في الطريق',
  [BookingStatus.IN_PROGRESS]: 'جاري التنفيذ',
  [BookingStatus.COMPLETED]: 'مكتمل',
  [BookingStatus.CANCELLED]: 'ملغي',
  [BookingStatus.DISPUTED]: 'تحت المراجعة',
};

/** Payment method display labels in Arabic */
export const PAYMENT_METHOD_LABELS_AR: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'كاش عند الاستلام',
  [PaymentMethod.FAWRY]: 'فوري',
  [PaymentMethod.VODAFONE_CASH]: 'فودافون كاش',
  [PaymentMethod.CREDIT_CARD]: 'بطاقة ائتمان',
  [PaymentMethod.WALLET]: 'محفظة حرفة',
};

/** Platform commission rate (18%) */
export const PLATFORM_COMMISSION_RATE = 0.18;

/** Maximum search radius for craftsmen (km) */
export const MAX_SEARCH_RADIUS_KM = 25;

/** OTP expiry in minutes */
export const OTP_EXPIRY_MINUTES = 10;
