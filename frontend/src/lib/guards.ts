import { api } from "@/lib/api";

export type ProfileGuardResult =
  | { ok: true }
  | { ok: false; reason: "NO_PROFILE" | "NOT_AUTHENTICATED" | "UNKNOWN"; message?: string };

export async function ensureHasProfile(): Promise<ProfileGuardResult> {
  try {
    // If user isn't authenticated, this will throw (401)
    await api.me();
  } catch (e: any) {
    const msg = e?.message ?? "";
    if (msg.includes("401")) return { ok: false, reason: "NOT_AUTHENTICATED", message: msg };
    return { ok: false, reason: "UNKNOWN", message: msg };
  }

  try {
    await api.getMyProfile();
    return { ok: true };
  } catch (e: any) {
    const msg = e?.message ?? "";

    // Our backend returns 404 if no profile yet
    if (msg.includes("404") || msg.toLowerCase().includes("profile not found")) {
      return { ok: false, reason: "NO_PROFILE", message: msg };
    }

    // Any other error
    return { ok: false, reason: "UNKNOWN", message: msg };
  }
}