"use client";

import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const role = useAuthStore((state) => state.role);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    user,
    accessToken,
    refreshToken,
    role,
    isAuthenticated,
    setAuth,
    clearAuth,
  };
};
