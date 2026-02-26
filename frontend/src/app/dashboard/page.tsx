"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { RecommendationResultItem } from "@/types/api";
import ResultsTable from "@/components/ResultsTable";
import ProbabilityChart from "@/components/ProbabilityChart";

export default function DashboardPage() {
  const router = useRouter();
  const [results, setResults] = useState<RecommendationResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await api.me();

        // Ensure profile exists
        await api.getMyProfile();

        // Run recommendations from that single profile
        const run = await api.runRecommendations(10);
        setResults(run.results);
      } catch (e: any) {
        const msg = e?.message ?? "";

        // If profile missing, send to onboarding
        if (msg.includes("404") || msg.toLowerCase().includes("profile not found")) {
          router.replace("/onboarding/profile");
          return;
        }

        // Not logged in
        if (msg.includes("401")) {
          router.replace("/login");
          return;
        }

        setErr(msg || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Your dashboard</div>
          <div className="text-slate-700">Recommendations based on your saved profile.</div>
        </div>
        <div className="flex gap-3">
          <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/profile">
            Edit profile
          </Link>
          <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/">
            Home
          </Link>
        </div>
      </header>

      {loading && <div className="rounded-xl border bg-white p-4">Loading recommendations…</div>}
      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{err}</div>}

      {!loading && !err && (
        <>
          <ResultsTable items={results} profileId={null} />
          <ProbabilityChart items={results} />
        </>
      )}
    </main>
  );
}