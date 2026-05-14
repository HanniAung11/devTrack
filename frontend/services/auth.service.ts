import api from "@/services/api";
import type { AuthPayload, DeveloperProfile, User } from "@/types";

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthPayload>("/api/auth/login/", {
    email,
    password,
  });
  return data;
}

export async function register(body: {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: "ADMIN" | "DEVELOPER";
}) {
  const { data } = await api.post<AuthPayload>("/api/auth/register/", body);
  return data;
}

export async function logout(refresh: string) {
  await api.post("/api/auth/logout/", { refresh });
}

export async function getProfile() {
  const { data } = await api.get<{
    user: User;
    developer: DeveloperProfile | null;
  }>("/api/auth/profile/");
  return data;
}

export async function updateProfile(body: {
  email?: string;
  full_name?: string;
  phone?: string;
}) {
  const { data } = await api.put<{
    user: User;
    developer: DeveloperProfile | null;
  }>("/api/auth/profile/", body);
  return data;
}

export async function listMentors() {
  const { data } = await api.get<
    { id: number; email: string; display_name: string }[]
  >("/api/auth/mentors/");
  return data;
}
