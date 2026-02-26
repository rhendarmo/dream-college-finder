"use client";

import { useState } from "react";
import type { ProfileUpsert } from "@/types/api";

type Props = {
  initial?: Partial<ProfileUpsert>;
  onSubmit: (payload: ProfileUpsert) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
};

export default function ProfileForm({ initial, onSubmit, loading, submitLabel }: Props) {
  const [gpa, setGpa] = useState(String(initial?.gpa ?? 3.7));
  const [sat, setSat] = useState(initial?.sat?.toString() ?? "");
  const [act, setAct] = useState(initial?.act?.toString() ?? "");
  const [intendedMajor, setIntendedMajor] = useState(initial?.intended_major ?? "Business Analytics");
  const [locationPreference, setLocationPreference] = useState(initial?.location_preference ?? "CA");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function toNumberOrNull(v: string): number | null {
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: ProfileUpsert = {
      gpa: Number(gpa),
      sat: toNumberOrNull(sat),
      act: toNumberOrNull(act),
      intended_major: intendedMajor.trim(),
      location_preference: locationPreference.trim() || null,
      notes: notes.trim() || null,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4 rounded-xl border bg-white p-4">
      <div className="text-xl font-semibold">Student Profile</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm font-medium">GPA</div>
          <input className="w-full rounded-md border px-3 py-2" value={gpa} onChange={(e) => setGpa(e.target.value)} required />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium">SAT (optional)</div>
          <input className="w-full rounded-md border px-3 py-2" value={sat} onChange={(e) => setSat(e.target.value)} />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium">ACT (optional)</div>
          <input className="w-full rounded-md border px-3 py-2" value={act} onChange={(e) => setAct(e.target.value)} />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium">Intended Major</div>
          <input className="w-full rounded-md border px-3 py-2" value={intendedMajor} onChange={(e) => setIntendedMajor(e.target.value)} required />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium">Location Preference</div>
          <input className="w-full rounded-md border px-3 py-2" value={locationPreference} onChange={(e) => setLocationPreference(e.target.value)} />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium">Notes (optional)</div>
          <textarea className="w-full rounded-md border px-3 py-2" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </label>
      </div>

      <button disabled={loading} className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
        {loading ? "Saving…" : submitLabel ?? "Save profile"}
      </button>
    </form>
  );
}