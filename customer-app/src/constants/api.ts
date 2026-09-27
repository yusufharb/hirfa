export const API_CONFIG = {
  BASE_URL: 'https://api.hirfa.com/v1',
  TIMEOUT: 10000,
  SOCKET_URL: 'https://api.hirfa.com',
};

export const ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
  },
  SERVICES: {
    LIST: '/services',
    DETAILS: (id: string) => `/services/${id}`,
    CRAFTSMEN_NEARBY: '/services/craftsmen/nearby',
  },
  BOOKINGS: {
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/me',
    DETAILS: (id: string) => `/bookings/${id}`,
    RATE: (id: string) => `/bookings/${id}/rate`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
  },
  USERS: {
    PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    NOTIFICATIONS: '/users/notifications',
  },
};