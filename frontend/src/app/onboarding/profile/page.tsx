"use client";

import { useEffect, useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import { api } from "@/lib/api";
import type { ProfileUpsert } from "@/types/api";
import { useRouter } from "next/navigation";

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await api.me();
        await api.getMyProfile();
        router.replace("/dashboard");
      } catch {
        // stay here if profile missing
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
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#dfe5f2]">
        <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#5b7cf0_0%,#2d3e84_34%,#101a36_100%)]">
          <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-28 text-white">
            Loading…
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#dfe5f2] text-slate-900">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#5b7cf0_0%,#2d3e84_34%,#101a36_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-8%] top-[22%] h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-[-8%] bottom-[14%] h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.28),transparent_60%)]" />

        <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 pt-32 md:px-8">
          <div className="mb-8 text-white">
            <h1 className="text-4xl font-bold md:text-5xl">Complete your profile</h1>
            <p className="mt-3 text-lg text-blue-100">
              This information will be used to generate your recommendations.
            </p>
          </div>

          {err && (
            <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">
              {err}
            </div>
          )}

          <ProfileForm onSubmit={handleSave} loading={saving} submitLabel="Save & continue" />
        </section>
      </div>
    </main>
  );
}