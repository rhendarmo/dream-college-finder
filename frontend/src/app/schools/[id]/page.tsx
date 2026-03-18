"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { School } from "@/types/api";
import { MapPin } from "lucide-react";

type ExplainResponse = {
  school_id: number;
  explanation: string;
  probability?: number;
  category?: string;
  breakdown?: {
    academic?: number;
    major_fit?: number;
    affordability?: number;
    outcomes?: number;
    preference?: number;
    total?: number;
  };
};

export default function SchoolDetailPage() {
  const params = useParams<{ id: string }>();
  const schoolId = useMemo(() => Number(params.id), [params.id]);

  const [school, setSchool] = useState<School | null>(null);
  const [explanation, setExplanation] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        await api.getMyProfile();

        const s = await api.getSchool(schoolId);
        if (cancelled) return;
        setSchool(s);

        const ex = await api.explainSchoolFit(schoolId);
        if (cancelled) return;
        setExplanation(ex as ExplainResponse);
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
  }, [schoolId]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f7f9ff_0%,#eef2ff_55%,#e7ecfb_100%)]" />
      <div className="absolute left-[-12%] bottom-[8%] h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="absolute right-[-10%] top-[16%] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-28 md:px-8">
        {loading && (
          <div className="rounded-2xl border border-white/60 bg-white/95 p-6 shadow-sm">
            Loading…
          </div>
        )}

        {err && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-800">
            {err}
          </div>
        )}

        {school && !loading && (
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.10)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">{school.name}</h1>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-lg text-slate-700">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    {school.state || "N/A"}
                  </div>
                </div>

                <Link
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-lg font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                  href="/dashboard"
                >
                  ← Dashboard
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Acceptance Rate"
                  value={fmtPct(school.admission_rate)}
                  accent="bg-blue-400"
                />
                <MetricCard
                  label="Avg SAT"
                  value={school.sat_avg?.toString() ?? "N/A"}
                  accent="bg-amber-400"
                />
                <MetricCard
                  label="Avg GPA"
                  value={school.gpa_avg != null ? school.gpa_avg.toFixed(2) : "N/A"}
                  accent="bg-blue-300"
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.10)]">
              <div className="text-3xl font-bold text-slate-900">Why this school?</div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-2xl font-medium leading-9 text-slate-800">
                {explanation?.explanation ?? "Generating explanation…"}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <SmallMetric
                  label="Tuition"
                  value={fmtCurrency(school.tuition_out ?? school.tuition_in ?? null)}
                  color="text-amber-600"
                />
                <SmallMetric
                  label="Grad Rate"
                  value={fmtPct(school.grad_rate_4yr ?? school.grad_rate_lt4 ?? null)}
                  color="text-emerald-600"
                />
                <SmallMetric
                  label="Median Earnings"
                  value={fmtCurrency(school.median_earnings_10yr ?? null)}
                  color="text-blue-700"
                />
              </div>
            </div>

            {explanation?.probability != null && (
              <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.10)]">
                <div className="mb-5 text-3xl font-bold text-slate-900">Admission Chances</div>

                <div className="flex flex-col gap-8 md:flex-row md:items-center">
                  <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-blue-500">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-slate-800">
                        {Math.round(explanation.probability * 100)}%
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-slate-500">
                        {explanation.category ?? ""}
                      </div>
                    </div>
                  </div>

                  {explanation.breakdown && (
                    <div className="grid flex-1 gap-3 md:grid-cols-2">
                      <Breakdown label="Academic" value={explanation.breakdown.academic} />
                      <Breakdown label="Major Fit" value={explanation.breakdown.major_fit} />
                      <Breakdown label="Affordability" value={explanation.breakdown.affordability} />
                      <Breakdown label="Outcomes" value={explanation.breakdown.outcomes} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <div className="text-lg font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-5xl font-bold text-slate-900">{value}</div>
      <div className={`mt-4 h-1.5 w-16 rounded-full ${accent}`} />
    </div>
  );
}

function SmallMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
      <div className="text-lg text-slate-500">{label}</div>
      <div className={`mt-2 text-4xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function Breakdown({ label, value }: { label: string; value?: number }) {
  const pct = Math.round((value ?? 0) * 100);
  return (
    <div>
      <div className="mb-1 text-base font-semibold text-slate-700">{label}</div>
      <div className="h-3 rounded-full bg-slate-200">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function fmtPct(x?: number | null) {
  if (x == null) return "N/A";
  return `${Math.round(x * 100)}%`;
}

function fmtCurrency(x?: number | null) {
  if (x == null) return "N/A";
  return `$${x.toLocaleString()}`;
}