"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { api } from "@/lib/api";
import type { Profile, ProfileUpsert } from "@/types/api";

export default function ProfileEditPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await api.me();
        const p = await api.getMyProfile();
        setProfile(p);
      } catch {
        router.replace("/login");
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
      setErr(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-[#eef2ff] px-6 pt-28">Loading…</main>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f7f9ff_0%,#eef2ff_55%,#e7ecfb_100%)]" />
      <div className="absolute left-[-8%] bottom-[6%] h-80 w-80 rounded-full bg-blue-200/35 blur-3xl" />
      <div className="absolute right-[-8%] top-[20%] h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-28 md:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Edit Profile</h1>
            <div className="mt-2 h-1 w-16 rounded-full bg-blue-400" />
          </div>

          <Link
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-lg font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            href="/dashboard"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {err && (
          <div className="mb-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">
            {err}
          </div>
        )}

        {profile && (
          <ProfileForm
            initial={{
              gpa: profile.gpa,
              sat: profile.sat,
              act: profile.act,
              intended_major: profile.intended_major,
              location_preference: profile.location_preference,
              notes: profile.notes,
            }}
            onSubmit={handleSave}
            loading={saving}
            submitLabel="Save Changes"
          />
        )}
      </section>
    </main>
  );
}