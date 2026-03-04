"use client";

import { useState } from "react";
import Link from "next/link";
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
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Assistant</div>
          <div className="text-slate-700">Ask questions grounded in Scorecard data.</div>
        </div>
        <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/dashboard">
          ← Dashboard
        </Link>
      </header>

      <div className="rounded-xl border bg-white p-4 space-y-3">
        <textarea
          className="w-full rounded-md border px-3 py-2"
          rows={3}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Try: "Compare UC Irvine vs UC Riverside for outcomes and affordability"'
        />
        <button
          disabled={loading || !q.trim()}
          onClick={ask}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Asking…" : "Ask"}
        </button>
      </div>

      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{err}</div>}

      {answer && (
        <div className="rounded-xl border bg-white p-4 space-y-3">
          <div className="text-lg font-semibold">Answer</div>
          <div className="whitespace-pre-wrap">{answer}</div>
          <div className="pt-2">
            <div className="text-sm font-semibold">Sources</div>
            <ul className="list-disc pl-6 text-sm text-slate-700">
              {cites.map((c) => (
                <li key={c.source_id}>
                  {c.title} <span className="text-slate-500">({c.source_id})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
}