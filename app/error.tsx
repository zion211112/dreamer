"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Navigation } from "@/components/site/Navigation";
import { Footer } from "@/components/site/Footer";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Navigation />
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="container text-center">
          <h1 className="text-3xl font-display font-bold text-white mb-4">
            Something went wrong
          </h1>
          <p className="text-neutral-300 mb-8">
            We&apos;re sorry, but an unexpected error occurred.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={reset} className="btn-primary">
              Try Again
            </button>
            <Link href="/" className="btn-secondary">
              Go Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}