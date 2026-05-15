import axios, { AxiosError } from "axios";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";

/** Flatten DRF / Django-style JSON errors into one readable line for toasts. */
export function formatDrfErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "";
  }
  const o = data as Record<string, unknown>;
  const asStrings = (val: unknown): string[] => {
    if (typeof val === "string") return [val];
    if (typeof val === "number" || typeof val === "boolean") return [String(val)];
    if (Array.isArray(val)) return val.flatMap((x) => asStrings(x));
    if (val && typeof val === "object") {
      const rec = val as Record<string, unknown>;
      if (typeof rec.string === "string") return [rec.string];
      if (typeof rec.message === "string") return [rec.message];
    }
    return [];
  };

  const fromDetail = asStrings(o.detail);
  if (fromDetail.length) return fromDetail.join(", ");

  const fromNonField = asStrings(o.non_field_errors);
  if (fromNonField.length) return fromNonField.join(", ");

  const parts: string[] = [];
  for (const [key, val] of Object.entries(o)) {
    if (key === "detail" || key === "non_field_errors") continue;
    const msgs = asStrings(val);
    for (const m of msgs) parts.push(`${key}: ${m}`);
  }
  return parts.join(" · ");
}

/** Use same-origin /api in the browser so Next rewrites proxy to Django when env is unset. */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return "";
  return "http://localhost:8000";
}

const baseURL = resolveApiBaseUrl();

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
      const data = error.response?.data;
      const message = formatDrfErrorMessage(data);
      toast.error(message || "Request failed");
    }

    return Promise.reject(error);
  }
);

export default api;
