"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, MailCheck } from "lucide-react";
import { api } from "@/lib/api";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      setLoading(true);
      setErr(null);
      setMsg(null);

      if (!token) {
        setErr("Missing token in URL.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.verifyEmail(token);
        if (!cancelled) setMsg(res.message);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Verification failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#dfe5f2] text-slate-900">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#5b7cf0_0%,#2d3e84_34%,#101a36_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-8%] top-[22%] h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-[-8%] bottom-[14%] h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.28),transparent_60%)]" />

        <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pt-28">
          <div className="w-full max-w-xl rounded-[28px] border border-white/40 bg-white/95 p-8 text-center shadow-[0_20px_80px_rgba(15,23,42,0.30)] backdrop-blur md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50">
              {msg ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <MailCheck className="h-8 w-8 text-blue-600" />}
            </div>

            <h1 className="mt-6 text-4xl font-bold text-slate-900">Verify Email</h1>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg text-slate-700">
              {loading && "Verifying your email…"}
              {err && <span className="text-red-700">{err}</span>}
              {msg && <span className="text-emerald-700">{msg}</span>}
            </div>

            {msg && (
              <div className="mt-8">
                <Link
                  className="inline-flex items-center rounded-2xl bg-gradient-to-b from-blue-400 to-blue-700 px-8 py-4 text-xl font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] hover:from-blue-300 hover:to-blue-600"
                  href="/login"
                >
                  Continue to Login
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}