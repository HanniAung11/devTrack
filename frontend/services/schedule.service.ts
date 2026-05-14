import api from "@/services/api";
import type { PaginatedResponse, Session } from "@/types";

export const scheduleService = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const { data } = await api.get<PaginatedResponse<Session>>(
      "/api/sessions/",
      {
        params,
      }
    );
    return data;
  },
  generate: async (batchId: number) => {
    const { data } = await api.post<{
      batch_id: number;
      sessions_created: number;
    }>("/api/sessions/generate/", { batch_id: batchId });
    return data;
  },
  create: async (body: Partial<Session>) => {
    const { data } = await api.post<Session>("/api/sessions/", body);
    return data;
  },
  patch: async (id: number, body: Partial<Session>) => {
    const { data } = await api.patch<Session>(`/api/sessions/${id}/`, body);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/sessions/${id}/`);
  },
};
