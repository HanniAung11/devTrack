import api from "@/services/api";
import type { AdminDashboardData, DeveloperDashboardData } from "@/types";

export const dashboardService = {
  admin: async () => {
    const { data } = await api.get<AdminDashboardData>(
      "/api/dashboard/admin/"
    );
    return data;
  },
  developer: async () => {
    const { data } = await api.get<DeveloperDashboardData>(
      "/api/dashboard/developer/"
    );
    return data;
  },
};
