import type {
  Profile,
  ProfileUpsert,
  RecommendationRunResponse,
  School,
  RegisterRequest,
  LoginRequest,
  MeResponse,
  VerifyEmailResponse,
} from "@/types/api";

import { http } from "@/lib/http";

export const api = {
  getSchool: (schoolId: number) =>
    http<School>(`/schools/${schoolId}`, { method: "GET" }),

  explainSchoolFit: (schoolId: number) =>
    http<{ school_id: number; explanation: string }>(`/schools/${schoolId}/explain`, {
      method: "GET",
    }),

  register: (payload: RegisterRequest) =>
    http<{ message: string }>("/auth/register", {
      method: "POST",
      body: payload, // ✅ no JSON.stringify needed now
    }),

  verifyEmail: (token: string) =>
    http<VerifyEmailResponse>("/auth/verify-email", {
      method: "POST",
      body: { token }, // ✅
    }),

  login: (payload: LoginRequest) =>
    http<{ message: string; user_id: number }>("/auth/login", {
      method: "POST",
      body: payload, // ✅
    }),

  logout: () =>
    http<{ message: string }>("/auth/logout", {
      method: "POST",
    }),

  me: () => http<MeResponse>("/auth/me", { method: "GET" }),

  getMyProfile: () => http<Profile>("/profiles/me", { method: "GET" }),

  upsertMyProfile: (payload: ProfileUpsert) =>
    http<Profile>("/profiles/me", {
      method: "PUT",
      body: payload, // ✅
    }),

  runRecommendations: (top_k = 10) =>
    http<RecommendationRunResponse>("/recommendations/run", {
      method: "POST",
      body: { top_k }, // ✅
    }),

  askRag: (question: string, top_k = 6) =>
    http<{ answer: string; citations: { source_id: string; title: string }[] }>(
      "/rag/ask",
      { method: "POST", body: { question, top_k } } // ✅
    ),

  uploadResume: (file: File) => {
    const form = new FormData();
    form.append("file", file);

    return http<any>("/resume/upload", {
      method: "POST",
      body: form, // ✅ helper detects FormData and avoids Content-Type
    });
  },

  getMyResume: () => http<any>("/resume/me", { method: "GET" }),

  runAdvice: () =>
    http<{ cached: boolean; advice: any }>("/advice/run", { method: "POST" }),
};