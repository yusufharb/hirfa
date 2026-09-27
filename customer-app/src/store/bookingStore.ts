import { create } from 'zustand';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  status: 'searching' | 'confirmed' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
  date: string;
  price?: number;
  craftsman?: any;
}

interface BookingState {
  currentBooking: Booking | null;
  myBookings: Booking[];
  selectedService: any | null;
  selectedAddress: any | null;
  setCurrentBooking: (booking: Booking | null) => void;
  setMyBookings: (bookings: Booking[]) => void;
  clearCurrentBooking: () => void;
  setSelectedService: (service: any) => void;
  setSelectedAddress: (address: any) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentBooking: null,
  myBookings: [],
  selectedService: null,
  selectedAddress: null,
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setMyBookings: (bookings) => set({ myBookings: bookings }),
  clearCurrentBooking: () => set({ currentBooking: null }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedAddress: (address) => set({ selectedAddress: address }),
}));