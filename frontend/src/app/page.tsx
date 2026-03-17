"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, BadgeCheck, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await api.me();
        router.replace("/dashboard");
      } catch {
        // stay here if not logged in
      }
    })();
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#dfe5f2] text-slate-900">
      <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#5b7cf0_0%,#2d3e84_34%,#101a36_100%)]">
        {/* glow accents */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]" />
        <div className="absolute left-[-8%] top-[22%] h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute right-[-8%] bottom-[14%] h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* wave-like bottom shapes */}
        <div className="absolute bottom-[-70px] left-[-8%] h-[260px] w-[60%] rounded-[100%] border border-white/10 bg-white/5 blur-sm" />
        <div className="absolute bottom-[-90px] right-[-8%] h-[300px] w-[65%] rounded-[100%] border border-white/10 bg-white/5 blur-sm" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_bottom,rgba(96,165,250,0.28),transparent_60%)]" />

        {/* content */}
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-32 text-center md:px-10">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-7xl">
              Find colleges that fit your profile.
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-blue-100 md:text-2xl">
              Create your student profile, get Reach/Target/Safety recommendations,
              and understand why each school fits.
            </p>

            <div className="mt-10">
              <Link
                href="/register"
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-b from-blue-300 to-blue-600 px-8 py-4 text-2xl font-bold text-white shadow-[0_12px_40px_rgba(37,99,235,0.45)] transition hover:scale-[1.02] hover:from-blue-200 hover:to-blue-500"
              >
                Find Your Fit
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid w-full max-w-6xl gap-5 md:grid-cols-3">
            <FeatureCard
              icon={<ClipboardList className="h-9 w-9 text-blue-500" />}
              title="One Profile"
              text="Create and update anytime."
            />
            <FeatureCard
              icon={<BadgeCheck className="h-9 w-9 text-blue-500" />}
              title="Smart Recommendations"
              text="Reach · Target · Safety with probabilities."
            />
            <FeatureCard
              icon={<BarChart3 className="h-9 w-9 text-blue-500" />}
              title="Explainable Results"
              text="See why each school is a match."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200/70 bg-white/95 px-8 py-9 text-center shadow-xl shadow-slate-900/10 backdrop-blur">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
        {icon}
      </div>
      <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
        {title}
      </h3>
      <p className="mt-3 text-lg leading-7 text-slate-600">{text}</p>
      <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-blue-300" />
    </div>
  );
}