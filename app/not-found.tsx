import type { Metadata } from "next";
import Link from "next/link";
import GeoArt from "../components/GeoArt";
// This 404 renders in the root layout, outside the (site) group, so the site
// primitives (.site-frame, .site-page, .site-action) are not loaded for it.
import "./site.css";

export const metadata: Metadata = {
  title: "No such page",
  description: "That address is not on the map yet.",
  robots: { index: false, follow: true },
};

// A 404 is just a missing page. No gate decides who gets in here.
export default function NotFound() {
  return (
    <main className="site-page bg-void text-ink">
      <div className="site-frame relative flex min-h-[60vh] items-center overflow-hidden">
        <GeoArt
          variant="ring"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 text-ink opacity-[0.09]"
        />
        <div className="relative mx-auto w-full max-w-2xl px-6 py-20 text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-dust uppercase">404 · Not found</p>
          <h1 className="page-title">No such page.</h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-sm leading-6 text-dust">
            That address is not on the map yet. Start from the front, or read the posture.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/" className="site-action">
              Back to the start →
            </Link>
            <Link href="/about" className="site-action-secondary">
              Why we build like this
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
