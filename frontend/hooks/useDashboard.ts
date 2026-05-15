"use client";

import { useCallback, useEffect, useState } from "react";

import { dashboardService } from "@/services/dashboard.service";
import type { AdminDashboardData, DeveloperDashboardData } from "@/types";

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.admin();
      setData(res);
    } catch (e) {
      if (typeof e === "object" && e !== null && "response" in e) {
        const ax = e as { response?: { status?: number; data?: unknown }; message?: string };
        const status = ax.response?.status;
        const detail =
          typeof ax.response?.data === "object" &&
          ax.response?.data !== null &&
          "detail" in (ax.response.data as object)
            ? String((ax.response.data as { detail: unknown }).detail)
            : "";
        if (status === 404) {
          setError(
            "Dashboard API not found. Start Django on port 8000 (python manage.py runserver) and restart the Next.js dev server."
          );
        } else {
          setError(detail || ax.message || "Failed to load dashboard");
        }
      } else {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export function useDeveloperDashboard() {
  const [data, setData] = useState<DeveloperDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.developer();
      setData(res);
    } catch (e) {
      if (typeof e === "object" && e !== null && "response" in e) {
        const ax = e as { response?: { status?: number; data?: unknown }; message?: string };
        const status = ax.response?.status;
        const detail =
          typeof ax.response?.data === "object" &&
          ax.response?.data !== null &&
          "detail" in (ax.response.data as object)
            ? String((ax.response.data as { detail: unknown }).detail)
            : "";
        if (status === 404) {
          setError(
            "Dashboard API not found. Start Django on port 8000 (python manage.py runserver) and restart the Next.js dev server."
          );
        } else {
          setError(detail || ax.message || "Failed to load dashboard");
        }
      } else {
        setError(e instanceof Error ? e.message : "Failed to load dashboard");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
