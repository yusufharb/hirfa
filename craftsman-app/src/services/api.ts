/**
 * HIRFA Craftsman App — API Service Layer
 * All API calls to the HIRFA backend REST API
 */

import axios, { AxiosError } from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  Booking,
  CraftsmanProfile,
  UpdateCraftsmanProfileRequest,
  PaginatedResponse,
} from '../../../shared/types';
import { useAuthStore } from '../store/authStore';

// ─────────────────────────────────────────────
// Axios Instance Configuration
// ─────────────────────────────────────────────

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
            `${BASE_URL}/api/auth/refresh-token`,
            { refreshToken }
          );
          const newToken = data.data!.accessToken;
          setTokens(newToken, refreshToken);
          originalRequest!.headers!.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest!);
        } catch {
          logout();
        }
      } else {
        logout();
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────
// AUTH ENDPOINTS
// ─────────────────────────────────────────────

export const authApi = {
  /**
   * Send OTP to phone number (Egyptian format: 01x xxxxxxxx)
   */
  sendOtp: async (phone: string): Promise<ApiResponse> => {
    const { data } = await apiClient.post('/auth/send-otp', { phone });
    return data;
  },

  /**
   * Verify OTP and authenticate. Returns tokens + user.
   * For craftsmen: role must be 'craftsman'
   */
  verifyOtp: async (
    phone: string,
    code: string,
    name?: string,
    fcmToken?: string
  ): Promise<ApiResponse<AuthResponse>> => {
    const { data } = await apiClient.post('/auth/verify-otp', {
      phone,
      code,
      name,
      role: 'craftsman',
      fcmToken,
    });
    return data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const { data } = await apiClient.post('/auth/refresh-token', { refreshToken });
    return data;
  },

  /**
   * Get current user profile
   */
  getMe: async (): Promise<ApiResponse<AuthResponse['user']>> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  /**
   * Logout (invalidate refresh token on server)
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
};

// ─────────────────────────────────────────────
// CRAFTSMAN ENDPOINTS
// ─────────────────────────────────────────────

export const craftsmanApi = {
  /**
   * Get own craftsman profile
   */
  getProfile: async (): Promise<ApiResponse<CraftsmanProfile>> => {
    const { data } = await apiClient.get('/craftsmen/profile');
    return data;
  },

  /**
   * Update profile (bio, experience, skills)
   */
  updateProfile: async (
    updates: UpdateCraftsmanProfileRequest
  ): Promise<ApiResponse<CraftsmanProfile>> => {
    const { data } = await apiClient.put('/craftsmen/profile', updates);
    return data;
  },

  /**
   * Toggle availability on/off
   */
  setAvailability: async (isAvailable: boolean): Promise<ApiResponse> => {
    const { data } = await apiClient.put('/craftsmen/availability', { isAvailable });
    return data;
  },

  /**
   * Update live GPS location (called every 30s when active)
   */
  updateLocation: async (lat: number, lng: number): Promise<ApiResponse> => {
    const { data } = await apiClient.put('/craftsmen/location', { lat, lng });
    return data;
  },

  /**
   * Get earnings summary
   */
  getEarnings: async (): Promise<ApiResponse<{
    today: number;
    thisMonth: number;
    walletBalance: number;
    pendingPayout: number;
  }>> => {
    const { data } = await apiClient.get('/craftsmen/earnings');
    return data;
  },

  /**
   * Get jobs list (history)
   */
  getJobs: async (
    page = 1,
    limit = 20
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> => {
    const { data } = await apiClient.get('/craftsmen/jobs', {
      params: { page, limit },
    });
    return data;
  },
};

// ─────────────────────────────────────────────
// BOOKING ENDPOINTS
// ─────────────────────────────────────────────

export const bookingApi = {
  /**
   * Accept a job request
   */
  acceptJob: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.put(`/bookings/${bookingId}/accept`);
    return data;
  },

  /**
   * Decline a job request (pass to next craftsman)
   */
  declineJob: async (bookingId: string, reason?: string): Promise<ApiResponse> => {
    const { data } = await apiClient.put(`/bookings/${bookingId}/decline`, { reason });
    return data;
  },

  /**
   * Mark job as started (craftsman arrived at customer)
   */
  startJob: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.put(`/bookings/${bookingId}/start`);
    return data;
  },

  /**
   * Mark job as completed
   */
  completeJob: async (
    bookingId: string,
    finalPrice: number
  ): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.put(`/bookings/${bookingId}/complete`, {
      finalPrice,
    });
    return data;
  },

  /**
   * Get booking details
   */
  getBooking: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    const { data } = await apiClient.get(`/bookings/${bookingId}`);
    return data;
  },
};
