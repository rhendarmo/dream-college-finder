"use client";

import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex items-center justify-between">
          <div className="text-2xl font-bold">dreamcollegefinder</div>
          <div className="flex gap-3">
            <Link className="rounded-md border bg-white px-4 py-2 hover:bg-slate-100" href="/login">
              Log in
            </Link>
            <Link className="rounded-md border bg-white px-4 py-2 hover:bg-slate-100" href="/register">
              Sign up
            </Link>
          </div>
        </header>

        <section className="max-w-2xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Find colleges that fit your profile.
          </h1>
          <p className="text-lg text-slate-700">
            Enter your academics and preferences once, then get Reach/Target/Safety recommendations with clear explanations.
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
          <Feature title="Explainable results" text="See why a school is a good match for you." />
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