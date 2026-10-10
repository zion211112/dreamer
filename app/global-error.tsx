"use client";

import Link from "next/link";
import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="container text-center">
            <h1 className="text-3xl font-display font-bold text-white mb-4">
              A critical error occurred
            </h1>
            <p className="text-neutral-300 mb-8">
              The application failed to render. Please try refreshing the page.
            </p>
            <button onClick={reset} className="btn-primary">
              Refresh
            </button>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}