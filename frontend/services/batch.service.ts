import api from "@/services/api";
import type { Batch, PaginatedResponse } from "@/types";

export type BatchWritePayload = {
  batch_name: string;
  mentor: number;
  start_date: string;
  end_date: string;
  duration_months: number;
  training_days: string[];
  attendance_target: number;
  status: string;
};

export const batchService = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const { data } = await api.get<PaginatedResponse<Batch>>("/api/batches/", {
      params,
    });
    return data;
  },
  get: async (id: number) => {
    const { data } = await api.get<Batch>(`/api/batches/${id}/`);
    return data;
  },
  create: async (body: BatchWritePayload) => {
    const { data } = await api.post<Batch>("/api/batches/", body);
    return data;
  },
  update: async (id: number, body: Partial<BatchWritePayload>) => {
    const { data } = await api.patch<Batch>(`/api/batches/${id}/`, body);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/api/batches/${id}/`);
  },
};
