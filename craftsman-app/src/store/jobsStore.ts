/**
 * HIRFA Craftsman App — Jobs Store (Zustand)
 * Manages job requests, active jobs, and job history state
 */

import { create } from 'zustand';
import type { Booking, NewJobRequestEvent } from '../../../shared/types';

interface JobsState {
  // Incoming job requests (real-time via socket)
  pendingRequests: NewJobRequestEvent[];
  // Active job (craftsman is currently working on this)
  activeJob: Booking | null;
  // Job history
  jobHistory: Booking[];
  // Loading states
  isLoadingActive: boolean;
  isLoadingHistory: boolean;
  // Earnings summary
  earningsToday: number;
  earningsThisMonth: number;
  walletBalance: number;

  // Actions
  addJobRequest: (request: NewJobRequestEvent) => void;
  removeJobRequest: (bookingId: string) => void;
  setActiveJob: (job: Booking | null) => void;
  updateActiveJobStatus: (status: Booking['status']) => void;
  setJobHistory: (jobs: Booking[]) => void;
  setEarnings: (today: number, month: number, balance: number) => void;
  clearPendingRequests: () => void;
}

export const useJobsStore = create<JobsState>()((set) => ({
  pendingRequests: [],
  activeJob: null,
  jobHistory: [],
  isLoadingActive: false,
  isLoadingHistory: false,
  earningsToday: 0,
  earningsThisMonth: 0,
  walletBalance: 0,

  addJobRequest: (request) =>
    set((state) => {
      // Avoid duplicate requests
      const exists = state.pendingRequests.some(
        (r) => r.bookingId === request.bookingId
      );
      if (exists) return state;
      return { pendingRequests: [request, ...state.pendingRequests] };
    }),

  removeJobRequest: (bookingId) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter(
        (r) => r.bookingId !== bookingId
      ),
    })),

  setActiveJob: (job) => set({ activeJob: job }),

  updateActiveJobStatus: (status) =>
    set((state) => ({
      activeJob: state.activeJob ? { ...state.activeJob, status } : null,
    })),

  setJobHistory: (jobs) => set({ jobHistory: jobs }),

  setEarnings: (today, month, balance) =>
    set({
      earningsToday: today,
      earningsThisMonth: month,
      walletBalance: balance,
    }),

  clearPendingRequests: () => set({ pendingRequests: [] }),
}));
