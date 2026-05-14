import api from "@/services/api";
import type { Developer, PaginatedResponse } from "@/types";

export const developerService = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const { data } = await api.get<PaginatedResponse<Developer>>(
      "/api/developers/",
      { params }
    );
    return data;
  },
  get: async (id: number) => {
    const { data } = await api.get<Developer>(`/api/developers/${id}/`);
    return data;
  },
  create: async (body: Partial<Developer>) => {
    const { data } = await api.post<Developer>("/api/developers/", body);
    return data;
  },
  update: async (id: number, body: Partial<Developer>) => {
    const { data } = await api.patch<Developer>(`/api/developers/${id}/`, body);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/developers/${id}/`);
  },
};
