import type {
  Profile,
  ProfileUpsert,
  ProfileCreate,
  RecommendationRunRequest,
  RecommendationRunResponse,
  School,
  SchoolExplainResponse,
  RegisterRequest,
  LoginRequest,
  MeResponse,
  VerifyEmailResponse,
} from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in .env.local");
}

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    credentials: "include", // IMPORTANT: cookie auth
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // createProfile: (payload: ProfileCreate) =>
  //   http<Profile>("/profiles", {
  //     method: "POST",
  //     body: JSON.stringify(payload),
  //   }),

  getSchool: (schoolId: number) =>
    http<School>(`/schools/${schoolId}`, { method: "GET" }),

  explainSchoolFit: (schoolId: number, profileId: number) =>
    http<SchoolExplainResponse>(`/schools/${schoolId}/explain?profile_id=${profileId}`, {
      method: "GET",
    }),

  register: (payload: RegisterRequest) =>
    http<{ message: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  verifyEmail: (token: string) =>
    http<VerifyEmailResponse>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  login: (payload: LoginRequest) =>
    http<{ message: string; user_id: number }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
    }),

  runRecommendations: (top_k = 10) =>
    http<RecommendationRunResponse>("/recommendations/run", {
      method: "POST",
      body: JSON.stringify({ top_k }),
    }),
};