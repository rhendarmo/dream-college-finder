"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { MeResponse } from "@/types/api";

export default function AuthStatus() {
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await api.me();
      setMe(res);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLogout() {
    await api.logout();

    // Clear local state
    setMe(null);

    // ✅ Redirect to welcome page after logout
    router.push("/");
  }

  if (loading) {
    return <div className="text-sm text-slate-600">Checking login…</div>;
  }

  if (!me) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          className="rounded-md border bg-white px-3 py-2 hover:bg-slate-100"
          href="/login"
        >
          Log in
        </Link>
        <Link
          className="rounded-md border bg-white px-3 py-2 hover:bg-slate-100"
          href="/register"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="rounded-md border bg-white px-3 py-2">
        Logged in as <span className="font-medium">{me.email}</span>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-md border bg-white px-3 py-2 hover:bg-slate-100"
      >
        Log out
      </button>
    </div>
  );
}