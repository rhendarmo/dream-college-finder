"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GraduationCap, UserCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import type { MeResponse } from "@/types/api";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const isLanding = pathname === "/";
  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/verify-email");

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

  function navClass(path: string) {
    const active = pathname === path;
    if (isLanding) {
      return active
        ? "border-b-2 border-blue-300 px-1 py-2 text-sm font-semibold text-white"
        : "px-1 py-2 text-sm font-medium text-blue-100 hover:text-white";
    }
    return active
      ? "border-b-2 border-blue-500 px-1 py-2 text-sm font-semibold text-slate-900"
      : "px-1 py-2 text-sm font-medium text-slate-700 hover:text-slate-900";
  }

  return (
    <header
      className={
        isLanding
          ? "absolute inset-x-0 top-0 z-50 border-b border-white/15"
          : "border-b border-slate-200 bg-white/90 backdrop-blur"
      }
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <Link
          href={me ? "/dashboard" : "/"}
          className="flex items-center gap-3"
        >
          <div
            className={
              isLanding
                ? "flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur"
                : "flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50"
            }
          >
            <GraduationCap
              className={isLanding ? "h-5 w-5 text-blue-100" : "h-5 w-5 text-blue-600"}
            />
          </div>

          <span
            className={
              isLanding
                ? "text-xl font-semibold tracking-tight text-white"
                : "text-xl font-semibold tracking-tight text-slate-900"
            }
          >
            Dream College Finder
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {!loading && me && !isPublic && (
            <>
              <Link className={navClass("/dashboard")} href="/dashboard">
                Dashboard
              </Link>
              <Link className={navClass("/assistant")} href="/assistant">
                AI Assistant
              </Link>
              <Link className={navClass("/resume")} href="/resume">
                Resume
              </Link>
              <Link className={navClass("/advice")} href="/advice">
                Advice
              </Link>

              <Link
                href="/profile"
                className={
                  isLanding
                    ? "text-blue-100 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                }
                aria-label="Edit profile"
                title="Edit profile"
              >
                <UserCircle2 className="h-8 w-8" />
              </Link>

              <button
                onClick={handleLogout}
                className={
                  isLanding
                    ? "rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/12"
                    : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                Log out
              </button>
            </>
          )}

          {!loading && !me && (
            <>
              {!isPublic && (
                <Link
                  className={
                    isLanding
                      ? "px-1 py-2 text-sm font-medium text-blue-100 hover:text-white"
                      : "px-1 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                  }
                  href="/"
                >
                  Home
                </Link>
              )}

              <Link
                href="/login"
                className={
                  isLanding
                    ? "rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/12"
                    : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                }
              >
                Log in
              </Link>

              <Link
                href="/register"
                className={
                  isLanding
                    ? "rounded-xl bg-gradient-to-b from-blue-400 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 hover:from-blue-300 hover:to-blue-500"
                    : "rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                }
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}