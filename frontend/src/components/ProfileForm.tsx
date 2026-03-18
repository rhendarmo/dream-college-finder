"use client";

import { useState } from "react";
import type { ProfileUpsert } from "@/types/api";
import { GraduationCap, ClipboardList, MapPin, FileText } from "lucide-react";

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
  const [locationPreference, setLocationPreference] = useState(initial?.location_preference ?? "");
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
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-[28px] border border-white/50 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.14)] backdrop-blur md:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
          <GraduationCap className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">Student Profile</div>
          <div className="text-sm text-slate-500">Keep this updated to improve recommendation quality.</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="GPA">
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none placeholder:text-slate-400"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            required
          />
        </Field>

        <Field label="SAT Score" icon={<ClipboardList className="h-4 w-4 text-emerald-500" />}>
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none placeholder:text-slate-400"
            value={sat}
            onChange={(e) => setSat(e.target.value)}
            placeholder="Optional"
          />
        </Field>

        <Field label="ACT Score">
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none placeholder:text-slate-400"
            value={act}
            onChange={(e) => setAct(e.target.value)}
            placeholder="Optional"
          />
        </Field>

        <Field label="Intended Major">
          <input
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none placeholder:text-slate-400"
            value={intendedMajor}
            onChange={(e) => setIntendedMajor(e.target.value)}
            required
          />
        </Field>

        <Field label="State Preference" icon={<MapPin className="h-4 w-4 text-blue-500" />}>
          <select
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none"
            value={locationPreference}
            onChange={(e) => setLocationPreference(e.target.value)}
          >
            {US_STATES.map((s) => (
              <option key={s.code || "NONE"} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Notes" icon={<FileText className="h-4 w-4 text-slate-500" />}>
          <textarea
            className="min-h-[128px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none placeholder:text-slate-400"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            rows={4}
          />
        </Field>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          disabled={loading}
          className="min-w-[220px] rounded-2xl bg-gradient-to-b from-blue-400 to-blue-700 px-8 py-4 text-xl font-bold text-white shadow-[0_14px_35px_rgba(37,99,235,0.30)] transition hover:from-blue-300 hover:to-blue-600 disabled:opacity-50"
        >
          {loading ? "Saving…" : submitLabel ?? "Save profile"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-2">
      <div className="flex items-center gap-2 text-base font-semibold text-slate-800">
        {icon}
        <span>{label}</span>
      </div>
      <div>{children}</div>
    </label>
  );
}