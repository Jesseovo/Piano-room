import { create } from "zustand";

interface BasicSettings {
  systemName: string;
  description: string;
  primaryColor: string;
  copyright: string;
  slotStartHour: number;
  slotEndHour: number;
  slotDurationMinutes: number;
}

interface ReservationSettings {
  maxAdvanceDays: number;
  signInGrace: number;
  maxNoShow: number;
}

interface PenaltyRule {
  id: number;
  violationCount: number;
  banDays: number;
  description: string;
}

interface SettingsState {
  basicSettings: BasicSettings | null;
  reservationSettings: ReservationSettings | null;
  penaltyRules: PenaltyRule[];
  setBasicSettings: (s: BasicSettings) => void;
  setReservationSettings: (s: ReservationSettings) => void;
  setPenaltyRules: (r: PenaltyRule[]) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  basicSettings: null,
  reservationSettings: null,
  penaltyRules: [],
  setBasicSettings: (s) => set({ basicSettings: s }),
  setReservationSettings: (s) => set({ reservationSettings: s }),
  setPenaltyRules: (r) => set({ penaltyRules: r }),
}));
