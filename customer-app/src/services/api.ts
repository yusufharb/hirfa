import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../constants/api';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (refreshToken) {
          const res = await axios.post(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
            refreshToken,
          });
          const { token: newToken, refreshToken: newRefreshToken } = res.data;
          useAuthStore.getState().setTokens(newToken, newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  sendOtp: (phone: string) => api.post(ENDPOINTS.AUTH.SEND_OTP, { phone }),
  verifyOtp: (phone: string, code: string, name?: string, role = 'customer') =>
    api.post(ENDPOINTS.AUTH.VERIFY_OTP, { phone, code, name, role }),
  getMe: () => api.get(ENDPOINTS.AUTH.ME),
};

export const servicesApi = {
  getServices: () => api.get(ENDPOINTS.SERVICES.LIST),
  getServiceById: (id: string) => api.get(ENDPOINTS.SERVICES.DETAILS(id)),
  getCraftsmenNearby: (serviceId: string, lat: number, lng: number) =>
    api.get(ENDPOINTS.SERVICES.CRAFTSMEN_NEARBY, { params: { serviceId, lat, lng } }),
};

export const bookingsApi = {
  createBooking: (data: any) => api.post(ENDPOINTS.BOOKINGS.CREATE, data),
  getMyBookings: () => api.get(ENDPOINTS.BOOKINGS.MY_BOOKINGS),
  getBookingById: (id: string) => api.get(ENDPOINTS.BOOKINGS.DETAILS(id)),
  rateBooking: (id: string, rating: number, comment: string) =>
    api.post(ENDPOINTS.BOOKINGS.RATE(id), { rating, comment }),
  cancelBooking: (id: string, reason: string) =>
    api.post(ENDPOINTS.BOOKINGS.CANCEL(id), { reason }),
};

export const usersApi = {
  updateProfile: (data: any) => api.put(ENDPOINTS.USERS.PROFILE, data),
  getAddresses: () => api.get(ENDPOINTS.USERS.ADDRESSES),
  addAddress: (data: any) => api.post(ENDPOINTS.USERS.ADDRESSES, data),
  deleteAddress: (id: string) => api.delete(`${ENDPOINTS.USERS.ADDRESSES}/${id}`),
  getNotifications: () => api.get(ENDPOINTS.USERS.NOTIFICATIONS),
};

export default api;