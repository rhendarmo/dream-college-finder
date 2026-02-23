"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { School } from "@/types/api";

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const profileIdParam = searchParams.get("profileId");

  const schoolId = useMemo(() => Number(params.id), [params.id]);
  const profileId = useMemo(
    () => (profileIdParam ? Number(profileIdParam) : null),
    [profileIdParam]
  );

  const [school, setSchool] = useState<School | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const s = await api.getSchool(schoolId);
        if (cancelled) return;
        setSchool(s);

        if (profileId) {
          const ex = await api.explainSchoolFit(schoolId, profileId);
          if (cancelled) return;
          setExplanation(ex.explanation);
        } else {
          setExplanation(null);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load school");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (Number.isFinite(schoolId)) load();
    return () => {
      cancelled = true;
    };
  }, [schoolId, profileId]);

  return (
    <main className="mx-auto min-h-screen max-w-4xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">School Detail</h1>
          <p className="text-slate-700">dreamcollegefinder</p>
        </div>
        <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/">
          ← Back
        </Link>
      </div>

      {loading && <div className="rounded-xl border bg-white p-4">Loading…</div>}

      {err && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          {err}
        </div>
      )}

      {school && !loading && (
        <>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-2xl font-semibold">{school.name}</div>
            <div className="mt-1 text-slate-700">
              {school.state ? `State: ${school.state}` : "State: N/A"}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Stat label="Acceptance Rate" value={fmtPct(school.acceptance_rate)} />
              <Stat label="Avg SAT" value={school.avg_sat?.toString() ?? "N/A"} />
              <Stat label="Avg GPA" value={school.avg_gpa?.toFixed(2) ?? "N/A"} />
            </div>

            {school.tags && (
              <div className="mt-4 text-sm text-slate-700">
                <span className="font-medium">Tags:</span> {school.tags}
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="text-xl font-semibold">Why this school?</div>
            <div className="mt-2 text-slate-800">
              {profileId
                ? explanation ?? "Generating explanation…"
                : "Open this page from the recommendations table to include your profile context."}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-3">
      <div className="text-xs font-medium text-slate-600">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function fmtPct(x?: number | null) {
  if (x == null) return "N/A";
  return `${Math.round(x * 100)}%`;
}