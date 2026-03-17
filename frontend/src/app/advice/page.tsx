"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <div className="text-xl font-semibold">{title}</div>

      {bullets.length ? (
        <ul className="list-disc pl-6 text-slate-800">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      ) : null}

      {actions.length ? (
        <div className="space-y-2">
          <div className="text-sm font-semibold text-slate-700">Actions</div>
          {actions.map((a: any, i: number) => (
            <div key={i} className="rounded-lg border bg-slate-50 p-3">
              <div className="font-medium">{a?.action ?? ""}</div>
              <div className="text-sm text-slate-700">{a?.why ?? ""}</div>
              <div className="text-xs text-slate-500 mt-1">
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

  // resume status
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
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Advice</div>
          <div className="text-slate-700">Personalized strategy by Reach/Target/Safety.</div>
        </div>
        <div className="flex gap-3">
          <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/resume">
            Upload Resume
          </Link>
          <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/dashboard">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Resume status banner */}
      <div className="rounded-xl border bg-white p-4">
        {hasResume === null ? (
          <div className="text-slate-600">Checking resume status…</div>
        ) : hasResume ? (
          <div>
            <div className="text-sm text-slate-600">Resume on file:</div>
            <div className="font-semibold">{resumeName ?? "Uploaded resume"}</div>
            <div className="mt-2">
              <Link className="text-sm underline" href="/resume">
                Replace resume
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-slate-700">No resume uploaded yet.</div>
            <div className="mt-2">
              <Link className="text-sm underline" href="/resume">
                Upload resume
              </Link>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={run}
        disabled={loading || hasResume === false}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        title={hasResume === false ? "Upload a resume to generate advice." : undefined}
      >
        {loading ? "Generating…" : "Generate Advice"}
      </button>

      {!canGenerate && (
        <div className="text-sm text-slate-600">
          Upload a resume first to enable advice generation.
        </div>
      )}

      {cached !== null && (
        <div className="text-sm text-slate-600">
          {cached ? "Showing cached advice (no changes detected)." : "Generated fresh advice."}
        </div>
      )}

      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{err}</div>}

      {advice && (
        <>
          <div className="rounded-xl border bg-white p-4">
            <div className="text-lg font-semibold">Guardrails</div>
            <ul className="list-disc pl-6 text-slate-700">
              {guardrails.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="text-lg font-semibold">Gap Summary</div>
            <ul className="list-disc pl-6 text-slate-700">
              {gapSummary.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Panel title="Reach Strategy" data={advice?.reach_strategy} />
            <Panel title="Target Strategy" data={advice?.target_strategy} />
            <Panel title="Safety Strategy" data={advice?.safety_strategy} />
          </div>

          <div className="rounded-xl border bg-white p-4">
            <div className="text-lg font-semibold">Next 30 Days</div>
            <ul className="list-disc pl-6 text-slate-700">
              {next30Days.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  );
}