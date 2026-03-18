"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireProfile from "@/components/RequireProfile";
import { api } from "@/lib/api";
import type { RecommendationResultItem, MeResponse } from "@/types/api";
import ResultsTable from "@/components/ResultsTable";
import ProbabilityChart from "@/components/ProbabilityChart";
import { Pencil } from "lucide-react";

export default function DashboardPage() {
  return (
    <RequireProfile>
      <DashboardInner />
    </RequireProfile>
  );
}

function DashboardInner() {
  const [results, setResults] = useState<RecommendationResultItem[]>([]);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const meRes = await api.me();
        const run = await api.runRecommendations(10);

        if (!cancelled) {
          setMe(meRes);
          setResults(run.results);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load recommendations");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const firstName =
    me?.email?.split("@")[0]?.replace(/[._-]/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) || "there";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f7f9ff_0%,#eef2ff_55%,#e7ecfb_100%)]" />
      <div className="absolute left-[-10%] top-[24%] h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="absolute right-[-10%] bottom-[10%] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.18),transparent_60%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-28 md:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900">
              Welcome back, <span className="text-blue-600">{firstName}!</span>
            </h1>
            <p className="mt-3 text-2xl text-slate-600">
              Here are your top college matches.
            </p>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-xl font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Pencil className="h-5 w-5" />
            Edit Profile
          </Link>
        </div>

        {loading && (
          <div className="rounded-2xl border border-white/60 bg-white/90 p-6 shadow-sm">
            Loading recommendations…
          </div>
        )}

        {err && (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-800">
            {err}
          </div>
        )}

        {!loading && !err && (
          <div className="space-y-5">
            <ResultsTable items={results} />
            <ProbabilityChart items={results} />
          </div>
        )}
      </section>
    </main>
  );
}