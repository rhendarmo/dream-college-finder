"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { MeResponse } from "@/types/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/verify-email");

  const isActive = (path: string) => (pathname === path ? "bg-slate-200" : "");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await api.me();
        if (!cancelled) setMe(res);
      } catch {
        if (!cancelled) setMe(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function handleLogout() {
    await api.logout();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold">
          Dream College Finder
        </Link>

        <nav className="flex items-center gap-3">
          {!loading && me && (
            <>
              <Link
                className={`rounded-md border px-3 py-2 text-sm hover:bg-slate-100 ${isActive(
                  "/dashboard"
                )}`}
                href="/dashboard"
              >
                Dashboard
              </Link>

              <Link
                className={`rounded-md border px-3 py-2 text-sm hover:bg-slate-100 ${isActive(
                  "/assistant"
                )}`}
                href="/assistant"
              >
                AI Assistant
              </Link>

              <Link
                className={`rounded-md border px-3 py-2 text-sm hover:bg-slate-100 ${isActive(
                  "/profile"
                )}`}
                href="/profile"
              >
                Edit profile
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100"
              >
                Log out
              </button>
            </>
          )}

          {!loading && !me && (
            <>
              {!isPublic && (
                <Link
                  className={`rounded-md border px-3 py-2 text-sm hover:bg-slate-100 ${isActive(
                    "/"
                  )}`}
                  href="/"
                >
                  Home
                </Link>
              )}

              <Link
                className={`rounded-md border px-3 py-2 text-sm hover:bg-slate-100 ${isActive(
                  "/login"
                )}`}
                href="/login"
              >
                Log in
              </Link>

              <Link
                className={`rounded-md border px-3 py-2 text-sm hover:bg-slate-100 ${isActive(
                  "/register"
                )}`}
                href="/register"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}