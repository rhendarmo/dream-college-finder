"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await api.me();
        router.replace("/dashboard");
      } catch {
        // not logged in -> stay on welcome page
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <section className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Find colleges that fit your profile.
          </h1>
          <p className="text-lg text-slate-700">
            Create one student profile, get Reach/Target/Safety recommendations, and understand why each school fits.
          </p>

          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center rounded-md bg-black px-5 py-3 text-white hover:opacity-90"
            >
              Find your fit →
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Feature title="One profile" text="Create your student profile once and edit anytime." />
          <Feature title="Smart recommendations" text="Reach/Target/Safety breakdown with probabilities." />
          <Feature title="Explainable results" text="See why a school is a match for you." />
        </section>
      </div>
    </main>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-slate-700">{text}</div>
    </div>
  );
}