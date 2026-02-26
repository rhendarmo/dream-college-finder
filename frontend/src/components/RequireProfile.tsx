"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureHasProfile } from "@/lib/guards";

type Props = {
  children: React.ReactNode;
};

export default function RequireProfile({ children }: Props) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await ensureHasProfile();
      if (cancelled) return;

      if (res.ok) {
        setReady(true);
        return;
      }

      // Auth is already handled by middleware, but keep this as backup
      if (res.reason === "NOT_AUTHENTICATED") {
        router.replace("/login?next=/dashboard");
        return;
      }

      if (res.reason === "NO_PROFILE") {
        router.replace("/onboarding/profile");
        return;
      }

      // Unknown errors: go to onboarding to avoid dead-end UX
      router.replace("/onboarding/profile");
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-5xl rounded-xl border bg-white p-4">
          Loading…
        </div>
      </main>
    );
  }

  return <>{children}</>;
}