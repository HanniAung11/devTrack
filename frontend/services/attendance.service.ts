import api from "@/services/api";
import type { Attendance, PaginatedResponse } from "@/types";

export const attendanceService = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const { data } = await api.get<PaginatedResponse<Attendance>>(
      "/api/attendance/",
      { params }
    );
    return data;
  },
  create: async (body: Partial<Attendance>) => {
    const { data } = await api.post<Attendance>("/api/attendance/", body);
    return data;
  },
  patch: async (id: number, body: Partial<Attendance>) => {
    const { data } = await api.patch<Attendance>(
      `/api/attendance/${id}/`,
      body
    );
    return data;
  },
};
