"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/ProfileForm";
import { api } from "@/lib/api";
import type { ProfileUpsert } from "@/types/api";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // Must be logged in
        await api.me();

        // If profile already exists, skip onboarding
        await api.getMyProfile();
        router.replace("/dashboard");
      } catch {
        // If /me fails -> send to login
        // If profile not found -> stay here
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function handleSave(payload: ProfileUpsert) {
    setSaving(true);
    setErr(null);
    try {
      await api.upsertMyProfile(payload);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-50 p-6">Loading…</main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Complete your profile</div>
          <div className="text-slate-700">This will be used to generate your recommendations.</div>
        </div>
        <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/">
          ← Home
        </Link>
      </header>

      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{err}</div>}

      <ProfileForm onSubmit={handleSave} loading={saving} submitLabel="Save & continue" />
    </main>
  );
}