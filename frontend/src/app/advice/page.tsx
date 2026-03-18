"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, FileText } from "lucide-react";
import { api } from "@/lib/api";

function asArray(x: any): string[] {
  if (Array.isArray(x)) return x.filter((v) => typeof v === "string");
  if (typeof x === "string" && x.trim()) return [x.trim()];
  return [];
}

function Panel({ title, data }: { title: string; data: any }) {
  const bullets = asArray(data?.bullets);
  const actions = Array.isArray(data?.actions) ? data.actions : [];

  return (
    <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.10)]">
      <div className="text-2xl font-bold text-slate-900">{title}</div>

      {bullets.length ? (
        <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}

      {actions.length ? (
        <div className="mt-5 space-y-3">
          <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </div>
          {actions.map((a: any, i: number) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-lg font-semibold text-slate-900">{a?.action ?? ""}</div>
              <div className="mt-1 text-slate-700">{a?.why ?? ""}</div>
              <div className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Difficulty: {a?.difficulty ?? ""}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function AdvicePage() {
  const [loading, setLoading] = useState(false);
  const [cached, setCached] = useState<boolean | null>(null);
  const [advice, setAdvice] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const [hasResume, setHasResume] = useState<boolean | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.getMyResume();
        setHasResume(true);
        setResumeName(r?.filename ?? null);
      } catch {
        setHasResume(false);
        setResumeName(null);
      }
    })();
  }, []);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const res = await api.runAdvice();
      setCached(res.cached);
      setAdvice(res.advice);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to generate advice");
    } finally {
      setLoading(false);
    }
  }

  const guardrails = asArray(advice?.guardrails);
  const gapSummary = asArray(advice?.gap_summary);
  const next30Days = asArray(advice?.next_30_days);

  const canGenerate = hasResume !== false;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f7f9ff_0%,#eef2ff_55%,#e7ecfb_100%)]" />
      <div className="absolute left-[-10%] top-[18%] h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="absolute right-[-10%] bottom-[10%] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.18),transparent_60%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-28 md:px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Advice</h1>
          <p className="mt-3 text-2xl text-slate-600">
            Personalized strategy by Reach, Target, and Safety.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.10)]">
          {hasResume === null ? (
            <div className="text-slate-600">Checking resume status…</div>
          ) : hasResume ? (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    Resume on file
                  </div>
                  <div className="text-xl font-bold text-slate-900">{resumeName}</div>
                  <Link className="mt-1 inline-block text-sm font-medium text-blue-700 underline" href="/resume">
                    Replace resume
                  </Link>
                </div>
              </div>

              <button
                onClick={run}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-700 px-8 py-4 text-xl font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:from-blue-300 hover:to-blue-600 disabled:opacity-50"
              >
                <Sparkles className="h-5 w-5" />
                {loading ? "Generating…" : "Generate Advice"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl text-slate-700">No resume uploaded yet.</div>
                <div className="mt-2">
                  <Link className="text-sm font-medium text-blue-700 underline" href="/resume">
                    Upload resume
                  </Link>
                </div>
              </div>
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-300 px-8 py-4 text-xl font-bold text-white opacity-70"
                title="Upload a resume to generate advice."
              >
                Generate Advice
              </button>
            </div>
          )}
        </div>

        {cached !== null && (
          <div className="mt-4 text-sm text-slate-600">
            {cached ? "Showing cached advice (no changes detected)." : "Generated fresh advice."}
          </div>
        )}

        {err && (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
            {err}
          </div>
        )}

        {advice && (
          <div className="mt-6 space-y-5">
            <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.10)]">
              <div className="text-2xl font-bold text-slate-900">Gap Summary</div>
              <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
                {gapSummary.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <Panel title="Reach Strategy" data={advice?.reach_strategy} />
              <Panel title="Target Strategy" data={advice?.target_strategy} />
              <Panel title="Safety Strategy" data={advice?.safety_strategy} />
            </div>

            <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_16px_50px_rgba(15,23,42,0.10)]">
              <div className="text-2xl font-bold text-slate-900">Next 30 Days</div>
              <ul className="mt-4 list-disc pl-6 text-slate-700 space-y-2">
                {next30Days.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!canGenerate && (
          <div className="mt-4 text-sm text-slate-600">
            Upload a resume first to enable advice generation.
          </div>
        )}
      </section>
    </main>
  );
}