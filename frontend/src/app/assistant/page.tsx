"use client";

import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default function AssistantPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [cites, setCites] = useState<{ source_id: string; title: string }[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function ask() {
    setErr(null);
    setLoading(true);
    setAnswer(null);
    setCites([]);

    try {
      const res = await api.askRag(q, 6);
      setAnswer(res.answer);
      setCites(res.citations);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to ask");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f7f9ff_0%,#eef2ff_55%,#e7ecfb_100%)]" />
      <div className="absolute left-[-10%] top-[24%] h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="absolute right-[-10%] bottom-[10%] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.18),transparent_60%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-28 md:px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Assistant</h1>
          <p className="mt-3 text-2xl text-slate-600">
            Ask questions grounded in Scorecard data.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/95 p-4 shadow-[0_16px_50px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4">
              <Search className="h-6 w-6 text-slate-500" />
              <input
                className="w-full bg-transparent text-2xl text-slate-900 outline-none placeholder:text-slate-400"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Try: "Compare UCLA and UCI"'
              />
            </div>

            <button
              disabled={loading || !q.trim()}
              onClick={ask}
              className="flex min-w-[140px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-700 px-6 py-4 text-2xl font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:from-blue-300 hover:to-blue-600 disabled:opacity-50"
            >
              {loading ? "Asking…" : "Ask"}
              {!loading && <ArrowRight className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-6 text-red-800">
            {err}
          </div>
        )}

        {answer && (
          <div className="mt-6 rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="text-2xl font-bold text-slate-900">Answer</div>
            <div className="mt-4 whitespace-pre-wrap text-lg leading-8 text-slate-700">
              {answer}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-5">
              <div className="text-lg font-semibold text-slate-900">Sources</div>
              <ul className="mt-3 list-disc pl-6 text-slate-700">
                {cites.map((c) => (
                  <li key={c.source_id}>
                    {c.title} <span className="text-slate-500">({c.source_id})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}