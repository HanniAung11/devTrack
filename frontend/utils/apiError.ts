import type { AxiosError } from "axios";

/** Pull a readable message from DRF error payloads. */

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as AxiosError<{ detail?: string | string[]; non_field_errors?: string[] }>;
  const data = err.response?.data;
  if (!data) return fallback;

  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail) && data.detail[0]) return String(data.detail[0]);
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return String(data.non_field_errors[0]);
  }

  const fieldErrors = data as Record<string, string[] | string>;
  const firstKey = Object.keys(fieldErrors).find(
    (k) => k !== "detail" && fieldErrors[k] != null
  );
  if (firstKey) {
    const val = fieldErrors[firstKey];
    if (Array.isArray(val) && val[0]) return `${firstKey}: ${val[0]}`;
    if (typeof val === "string") return `${firstKey}: ${val}`;
  }

  return fallback;
}
