import { create } from 'zustand';
import api from '../api/client';
import { User, PlayerProfile, TalentReportResponse } from '../types';

interface AppState {
  user: User | null;
  token: string | null;
  currentProfile: PlayerProfile | null;
  activeSport: string;
  isLoading: boolean;
  activeReport: TalentReportResponse | null;

  // Assessment Wizard state
  wizardStep: number;
  wizardData: {
    sport: string;
    role: string;
    profile: Partial<PlayerProfile>;
    batting: any;
    bowling: any;
    physical: any[];
    cvResults: any;
  };

  // Actions
  setAuth: (user: User | null, token: string | null) => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  switchDemoUser: (role: string) => Promise<void>;
  setWizardStep: (step: number) => void;
  updateWizardData: (data: Partial<AppState['wizardData']>) => void;
  resetWizard: () => void;
  setActiveReport: (report: TalentReportResponse | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: localStorage.getItem('starq_token'),
  currentProfile: null,
  activeSport: 'cricket',
  isLoading: false,
  activeReport: null,

  wizardStep: 1,
  wizardData: {
    sport: 'cricket',
    role: 'batter',
    profile: {},
    batting: {},
    bowling: {},
    physical: [],
    cvResults: null,
  },

  setAuth: (user, token) => {
    if (token) {
      localStorage.setItem('starq_token', token);
    } else {
      localStorage.removeItem('starq_token');
    }
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('starq_token');
    set({ user: null, token: null, currentProfile: null, activeReport: null });
  },

  fetchCurrentUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      set({ isLoading: true });
      const res = await api.get('/auth/me');
      set({
        user: res.data.user,
        currentProfile: res.data.profile,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('starq_token');
      set({ user: null, token: null, currentProfile: null, isLoading: false });
    }
  },

  switchDemoUser: async (role: string) => {
    try {
      set({ isLoading: true });
      const res = await api.post(`/auth/demo/${role}`);
      localStorage.setItem('starq_token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isLoading: false,
      });
      // Fetch user and profile
      await get().fetchCurrentUser();
    } catch (err) {
      console.error('Demo switch error:', err);
      set({ isLoading: false });
    }
  },

  setWizardStep: (step) => set({ wizardStep: step }),

  updateWizardData: (data) =>
    set((state) => ({
      wizardData: { ...state.wizardData, ...data },
    })),

  resetWizard: () =>
    set({
      wizardStep: 1,
      wizardData: {
        sport: 'cricket',
        role: 'batter',
        profile: {},
        batting: {},
        bowling: {},
        physical: [],
        cvResults: null,
      },
    }),

  setActiveReport: (report) => set({ activeReport: report }),
}));
