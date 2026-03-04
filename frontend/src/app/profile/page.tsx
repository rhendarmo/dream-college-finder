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

  if (loading) return <main className="min-h-screen bg-slate-50 p-6">Loading…</main>;

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Edit profile</div>
          <div className="text-slate-700">Update your details anytime.</div>
        </div>
        <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/dashboard">
          ← Dashboard
        </Link>
      </header>

      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{err}</div>}

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
          submitLabel="Save changes"
        />
      )}
    </main>
  );
}