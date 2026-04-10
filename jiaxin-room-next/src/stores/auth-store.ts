import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  username: string;
  realName: string;
  studentId?: string;
  email: string;
  phone?: string;
  grade?: string;
  major?: string;
  userType: "student" | "teacher" | "admin" | "super_admin";
  avatarUrl?: string;
  status: number;
  violationCount: number;
  banUntil?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  setAuth: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      isSuperAdmin: false,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isLoggedIn: true,
          isAdmin: user.userType === "admin" || user.userType === "super_admin",
          isSuperAdmin: user.userType === "super_admin",
        }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        set({
          token: null,
          user: null,
          isLoggedIn: false,
          isAdmin: false,
          isSuperAdmin: false,
        });
      },
    }),
    {
      name: "jiaxin-room-auth",
    }
  )
);
