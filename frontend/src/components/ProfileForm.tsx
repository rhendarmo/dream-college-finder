"use client";

import { useState } from "react";
import type { ProfileCreate } from "@/types/api";

type Props = {
  onSubmit: (payload: ProfileCreate) => Promise<void>;
  loading?: boolean;
};

export default function ProfileForm({ onSubmit, loading }: Props) {
  const [gpa, setGpa] = useState("3.7");
  const [sat, setSat] = useState("1450");
  const [intendedMajor, setIntendedMajor] = useState("Business Analytics");
  const [locationPreference, setLocationPreference] = useState("CA");
  const [notes, setNotes] = useState("");

  function toNumberOrNull(v: string): number | null {
    const trimmed = v.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: ProfileCreate = {
      gpa: Number(gpa),
      sat: toNumberOrNull(sat),
      act: null,
      intended_major: intendedMajor.trim(),
      location_preference: locationPreference.trim() || null,
      notes: notes.trim() || null,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4 rounded-xl border p-4">
      <div className="text-xl font-semibold">Student Profile</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <div className="text-sm font-medium">GPA</div>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            inputMode="decimal"
            required
          />
        </label>

        <label className="space-y-1">
          <div className="text-sm font-medium">SAT (optional)</div>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={sat}
            onChange={(e) => setSat(e.target.value)}
            inputMode="numeric"
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium">Intended Major</div>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={intendedMajor}
            onChange={(e) => setIntendedMajor(e.target.value)}
            required
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium">Location Preference (e.g., CA)</div>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
          />
        </label>

        <label className="space-y-1 md:col-span-2">
          <div className="text-sm font-medium">Notes (optional)</div>
          <textarea
            className="w-full rounded-md border px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Working..." : "Get Recommendations"}
      </button>
    </form>
  );
}