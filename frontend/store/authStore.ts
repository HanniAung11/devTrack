"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "@/types";
import { clearAuthCookies, setAuthCookies } from "@/utils/cookies";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: Role | null;
  isAuthenticated: boolean;
  setAuth: (payload: {
    user: User;
    access: string;
    refresh: string;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      role: null,
      isAuthenticated: false,
      setAuth: ({ user, access, refresh }) => {
        setAuthCookies(access, refresh, user.role);
        set({
          user,
          accessToken: access,
          refreshToken: refresh,
          role: user.role,
          isAuthenticated: true,
        });
      },
      clearAuth: () => {
        clearAuthCookies();
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          role: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "devtrack-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
