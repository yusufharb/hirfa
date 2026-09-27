export interface User {
  id: string;
  name: string;
  phone: string;
  joinedAt: string;
  totalBookings: number;
  spent: number;
  isActive: boolean;
}

export interface CraftsmanProfile {
  id: string;
  name: string;
  phone: string;
  skills: string[];
  rating: number;
  totalJobs: number;
  walletBalance: number;
  isVerified: boolean;
  status: 'active' | 'suspended' | 'pending';
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

export interface Booking {
  id: string;
  customerName: string;
  craftsmanName: string;
  service: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  scheduledFor: string;
  amount: number;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: string;
  status: 'success' | 'pending' | 'failed';
  date: string;
}

export interface DashboardStats {
  totalBookingsToday: number;
  bookingsTrend: number;
  revenueToday: number;
  revenueTrend: number;
  activeCraftsmen: number;
  craftsmenTrend: number;
  newCustomersThisWeek: number;
  customersTrend: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
