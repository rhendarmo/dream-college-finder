"use client";

import { useState } from "react";
import type { ProfileUpsert } from "@/types/api";

type Props = {
  initial?: Partial<ProfileUpsert>;
  onSubmit: (payload: ProfileUpsert) => Promise<void>;
  loading?: boolean;
  submitLabel?: string;
};

const US_STATES = [
  { code: "", name: "No state preference" },
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" }, { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" }, { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" }, { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" }, { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" }, { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" }, { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
];

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
          <div className="text-sm font-medium">State Preference</div>
          <select
            className="w-full rounded-md border px-3 py-2"
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
          >
            {US_STATES.map((s) => (
              <option key={s.code || "NONE"} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
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