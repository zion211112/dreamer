"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CrucibleGate() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <main className="bg-obsidian text-ivory">
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-mono text-xs tracking-[0.2em] text-muted">GATE</p>
        <h1 className="mt-4 font-display text-3xl font-semibold">Redirecting to the root.</h1>
        <p className="mt-3 text-sm text-muted">This route is closed as a live page and returns to the main entry.</p>
      </div>
    </main>
  );
}
