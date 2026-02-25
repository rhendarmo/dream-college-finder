"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
    <main className="mx-auto min-h-screen max-w-xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Verify Email</h1>
        <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/">
          ← Home
        </Link>
      </div>

      <div className="rounded-xl border bg-white p-4">
        {loading && <div>Verifying…</div>}
        {err && <div className="text-red-700">{err}</div>}
        {msg && (
          <div className="space-y-3">
            <div className="text-green-800">{msg}</div>
            <Link className="inline-block rounded-md bg-black px-4 py-2 text-white" href="/login">
              Continue to login
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}