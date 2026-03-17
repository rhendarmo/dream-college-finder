"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Resume = {
  id: number;
  user_id: number;
  filename: string;
  created_at?: string | null;
  updated_at?: string | null;
  parsed?: any;
};

export default function ResumePage() {
  const [existing, setExisting] = useState<Resume | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function loadExisting() {
    setLoadingExisting(true);
    setErr(null);
    try {
      const r = await api.getMyResume();
      setExisting(r);
    } catch (e: any) {
      // 404 is normal if no resume
      setExisting(null);
    } finally {
      setLoadingExisting(false);
    }
  }

  useEffect(() => {
    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      await api.uploadResume(file);
      setMsg(existing ? "Resume replaced successfully." : "Resume uploaded successfully.");
      setFile(null);
      await loadExisting();
    } catch (e: any) {
      setErr(e?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">Resume</div>
          <div className="text-slate-700">Upload your resume PDF for personalized advice.</div>
        </div>
        <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/dashboard">
          ← Dashboard
        </Link>
      </header>

      <div className="rounded-xl border bg-white p-4 space-y-3">
        {loadingExisting ? (
          <div className="text-slate-600">Checking for existing resume…</div>
        ) : existing ? (
          <div className="rounded-lg border bg-slate-50 p-3">
            <div className="text-sm text-slate-600">Current resume on file</div>
            <div className="font-semibold">{existing.filename}</div>
            <div className="text-xs text-slate-500">
              {existing.updated_at ? `Updated: ${existing.updated_at}` : `Uploaded (id): ${existing.id}`}
            </div>
            <div className="mt-2 text-sm text-slate-700">
              You can re-upload to replace it.
            </div>
          </div>
        ) : (
          <div className="text-slate-700">No resume uploaded yet.</div>
        )}

        <div className="space-y-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            disabled={!file || loading}
            onClick={upload}
            className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Uploading…" : existing ? "Replace Resume" : "Upload Resume"}
          </button>
        </div>
      </div>

      {msg && <div className="rounded-xl border bg-white p-4">{msg}</div>}
      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{err}</div>}
    </main>
  );
}