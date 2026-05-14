import api from "@/services/api";
import type { Assignment, PaginatedResponse, Submission } from "@/types";

export const assignmentService = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const { data } = await api.get<PaginatedResponse<Assignment>>(
      "/api/assignments/",
      { params }
    );
    return data;
  },
  create: async (body: {
    title: string;
    description: string;
    batch: number;
    due_date: string;
  }) => {
    const { data } = await api.post<Assignment>("/api/assignments/", body);
    return data;
  },
  patch: async (id: number, body: Partial<Assignment>) => {
    const { data } = await api.patch<Assignment>(
      `/api/assignments/${id}/`,
      body
    );
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/assignments/${id}/`);
  },
  submissions: {
    list: async (params?: Record<string, string | number | undefined>) => {
      const { data } = await api.get<PaginatedResponse<Submission>>(
        "/api/assignments/submissions/",
        { params }
      );
      return data;
    },
    create: async (body: Partial<Submission> & { assignment: number }) => {
      const { data } = await api.post<Submission>(
        "/api/assignments/submissions/",
        body
      );
      return data;
    },
  },
};
