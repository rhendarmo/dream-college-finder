"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import ResultsTable from "@/components/ResultsTable";
import ProbabilityChart from "@/components/ProbabilityChart";
import AuthStatus from "@/components/AuthStatus";
import { api } from "@/lib/api";
import type { ProfileCreate, RecommendationResultItem } from "@/types/api";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<number | null>(null);
  const [results, setResults] = useState<RecommendationResultItem[]>([]);
  const [profileId, setProfileId] = useState<number | null>(null);

  async function handleSubmit(payload: ProfileCreate) {
    setLoading(true);
    setError(null);
    setResults([]);
    setRunId(null);

    try {
      const profile = await api.createProfile(payload);
      setProfileId(profile.id);

      const run = await api.runRecommendations({ profile_id: profile.id, top_k: 10 });
      setRunId(run.run_id);
      setResults(run.results);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">dreamcollegefinder</h1>
          <p className="text-slate-700">MVP demo: Profile → Recommendations (Reach/Target/Safety)</p>
        </div>
        <AuthStatus />
      </div>

      <ProfileForm onSubmit={handleSubmit} loading={loading} />

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          {error}
        </div>
      )}

      {runId && (
        <div className="text-sm text-slate-600">
          Recommendation run id: <span className="font-mono">{runId}</span>
        </div>
      )}

      <ResultsTable items={results} profileId={profileId} />
      <ProbabilityChart items={results} />
    </main>
  );
}