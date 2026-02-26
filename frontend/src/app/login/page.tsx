"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ honor ?next=... (default to onboarding)
  const next = searchParams.get("next") || "/onboarding/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await api.login({ email, password });
      router.push(next); // ✅ redirect to next
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl space-y-6 bg-slate-50 p-6 text-slate-900">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Log in</h1>
        <Link
          className="rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-100"
          href="/"
        >
          ← Home
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-white p-4"
      >
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
        </label>

        <button
          disabled={loading}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
          type="submit"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      {err && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-800">
          {err}
        </div>
      )}

      <div className="text-sm text-slate-700">
        No account yet?{" "}
        <Link className="underline underline-offset-2" href="/register">
          Sign up
        </Link>
      </div>
    </main>
  );
}