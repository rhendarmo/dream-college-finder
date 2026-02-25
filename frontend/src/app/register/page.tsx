"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { validatePassword } from "@/lib/passwordRules";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setErr(passwordError);
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({ email, password });
      setMsg(res.message + " (In dev, check backend console for verification link if SMTP not configured.)");
    } catch (e: any) {
      setErr(e?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sign up</h1>
        <Link className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100" href="/">
          ← Home
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-4">
        <label className="block space-y-1">
          <div className="text-sm font-medium">Email</div>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>

        <label className="block space-y-1">
          <div className="text-sm font-medium">Password</div>
          <input
            className="w-full rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <div className="text-xs text-slate-600">
            Min 8 chars, include 1 uppercase, 1 number, 1 symbol.
          </div>
        </label>

        <button
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          type="submit"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      {err && <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">{err}</div>}
      {msg && <div className="rounded-xl border border-green-300 bg-green-50 p-4 text-green-900">{msg}</div>}

      <div className="text-sm text-slate-700">
        Already have an account?{" "}
        <Link className="underline underline-offset-2" href="/login">
          Log in
        </Link>
      </div>
    </main>
  );
}