"use client";

import { useEffect, useState } from "react";
import { FileText, Upload } from "lucide-react";
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
    } catch {
      setExisting(null);
    } finally {
      setLoadingExisting(false);
    }
  }

  useEffect(() => {
    loadExisting();
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
    <main className="relative min-h-screen overflow-hidden bg-[#eef2ff] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#f7f9ff_0%,#eef2ff_55%,#e7ecfb_100%)]" />
      <div className="absolute left-[-10%] top-[18%] h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="absolute right-[-10%] bottom-[8%] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.18),transparent_60%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-28 md:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900">Resume</h1>
          <p className="mt-3 text-2xl text-slate-600">
            Upload your resume PDF for personalized advice.
          </p>
        </div>

        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="rounded-[28px] border border-slate-200 bg-white/95 p-6 shadow-sm">
            {loadingExisting ? (
              <div className="text-slate-600">Checking for existing resume…</div>
            ) : existing ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 text-3xl font-bold text-slate-900">Current resume on file</div>

                <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">{existing.filename}</div>
                    <div className="mt-2 text-lg text-slate-500">
                      {existing.updated_at
                        ? `Uploaded: ${existing.updated_at}`
                        : `Uploaded (id): ${existing.id}`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4 text-xl text-slate-500">
                  You can re-upload to replace it.
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-lg text-slate-700">
                No resume uploaded yet.
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="max-w-full text-lg"
              />

              <button
                disabled={!file || loading}
                onClick={upload}
                className="inline-flex min-w-[260px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-700 px-8 py-4 text-2xl font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:from-blue-300 hover:to-blue-600 disabled:opacity-50"
              >
                <Upload className="h-6 w-6" />
                {loading ? "Uploading…" : existing ? "Replace Resume" : "Upload Resume"}
              </button>
            </div>
          </div>
        </div>

        {msg && (
          <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-green-300 bg-green-50 p-4 text-green-800">
            {msg}
          </div>
        )}

        {err && (
          <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-red-300 bg-red-50 p-4 text-red-800">
            {err}
          </div>
        )}
      </section>
    </main>
  );
}