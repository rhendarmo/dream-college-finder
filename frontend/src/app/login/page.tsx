"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/onboarding/profile";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      await api.login({ email, password });
      router.push(next);
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#dfe5f2] text-slate-900">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#5b7cf0_0%,#2d3e84_34%,#101a36_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-8%] top-[22%] h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-[-8%] bottom-[14%] h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute bottom-[-70px] left-[-8%] h-[260px] w-[60%] rounded-[100%] border border-white/10 bg-white/5 blur-sm" />
        <div className="absolute bottom-[-90px] right-[-8%] h-[300px] w-[65%] rounded-[100%] border border-white/10 bg-white/5 blur-sm" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.28),transparent_60%)]" />

        <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-10 pt-28 md:px-10">
          <div className="w-full max-w-xl rounded-[28px] border border-white/40 bg-white/95 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.30)] backdrop-blur md:p-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
                Welcome Back
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Log in to continue exploring your best-fit colleges.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="space-y-2">
                <label className="text-base font-semibold text-slate-900">Email</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <input
                    className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-base font-semibold text-slate-900">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-4 shadow-sm">
                  <Lock className="h-5 w-5 text-slate-500" />
                  <input
                    className="w-full bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 px-6 py-4 text-2xl font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:from-blue-400 hover:to-blue-600 disabled:opacity-50"
                type="submit"
              >
                {loading ? "Logging in…" : "Log In"}
                {!loading && <ArrowRight className="h-6 w-6" />}
              </button>
            </form>

            {err && (
              <div className="mt-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-800">
                {err}
              </div>
            )}

            <div className="mt-8 text-center text-xl text-slate-700">
              Don&apos;t have an account?{" "}
              <Link className="font-semibold text-blue-700 underline underline-offset-4" href="/register">
                Sign Up
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}