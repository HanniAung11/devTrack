import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail?: string }>) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };
    const url = originalRequest?.url ?? "";

    if (url.includes("/api/auth/token/refresh/")) {
      if (typeof window !== "undefined") {
        const msg =
          (error.response?.data as { detail?: string })?.detail ?? error.message;
        toast.error(typeof msg === "string" ? msg : "Session expired");
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const { refreshToken, setAuth, clearAuth, user } = useAuthStore.getState();

      if (!refreshToken || !user) {
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post<{ access: string; refresh?: string }>(
          `${baseURL}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );
        const newAccess = response.data.access;
        const newRefresh = response.data.refresh ?? refreshToken;
        setAuth({ user, access: newAccess, refresh: newRefresh });
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch {
        clearAuth();
        if (typeof window !== "undefined") {
          toast.error("Session expired. Please sign in again.");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    if (typeof window !== "undefined" && error.response?.status !== 401) {
      const data = error.response?.data as { detail?: string | string[] };
      const d = data?.detail;
      const message =
        typeof d === "string"
          ? d
          : Array.isArray(d)
            ? d.join(", ")
            : error.message;
      toast.error(message || "Request failed");
    }

    return Promise.reject(error);
  }
);

export default api;
