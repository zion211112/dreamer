"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COMPANY, STACK, LIVE_BUILDS, MEASURES } from "@/lib/system";

export function HomeHero() {
  const [visible, setVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const prototypeCount = STACK.flatMap((layer) => layer.items).filter((item) => item.state === "PROTOTYPE").length;
  const plannedCount = STACK.flatMap((layer) => layer.items).filter((item) => item.state === "PLANNED").length;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg noise-overlay"
      aria-labelledby="hero-heading"
      onMouseMove={(e) => setMousePosition({ x: (e.clientX / window.innerWidth - 0.5) * 20, y: (e.clientY / window.innerHeight - 0.5) * 20 })}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full bg-gradient-to-r from-accent-500/20 to-accent-400/10 blur-3xl animate-float"
          style={{
            width: "600px",
            height: "600px",
            top: "-100px",
            right: "-100px",
            transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          }}
        />
        <div
          className="absolute rounded-full bg-gradient-to-r from-violet-500/15 to-violet-400/5 blur-3xl animate-float"
          style={{
            width: "400px",
            height: "400px",
            bottom: "-50px",
            left: "-50px",
            animationDelay: "2s",
            transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
          }}
        />
        <div
          className="absolute rounded-full bg-gradient-to-r from-amber-500/10 to-amber-400/5 blur-3xl animate-float"
          style={{
            width: "300px",
            height: "300px",
            top: "40%",
            left: "50%",
            animationDelay: "4s",
            transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
          }}
        />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none grid-pattern" aria-hidden="true" />

      <div className="relative container py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700/50 text-sm font-medium text-neutral-300 mb-8 animate-in ${visible ? "visible" : ""}`}
            style={{ animationDelay: "100ms" }}
          >
            <span className="relative flex h-2 w-2 rounded-full bg-accent-500 animate-pulse-soft" aria-hidden="true" />
            <span>PROTOTYPE — Built locally, not deployed</span>
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className={`text-hero font-display font-bold tracking-tight leading-[1.05] mb-8 animate-in ${visible ? "visible" : ""}`}
            style={{ animationDelay: "200ms" }}
          >
            <span className="block text-white">Locally owned</span>
            <span className="block gradient-text-brand">institutional infrastructure</span>
            <span className="block text-neutral-300">systems</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-bodyLg text-neutral-300 max-w-3xl mx-auto mb-12 leading-relaxed animate-in ${visible ? "visible" : ""}`}
            style={{ animationDelay: "300ms" }}
          >
            {COMPANY.supporting}
          </p>

          {/* Key metrics bar */}
          <div
            className={`flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-12 animate-in ${visible ? "visible" : ""}`}
            style={{ animationDelay: "400ms" }}
            role="list"
            aria-label="Key metrics"
          >
            {MEASURES.map((measure, index) => (
              <div
                key={measure.key}
                className="flex flex-col items-center gap-1"
                role="listitem"
              >
                <span className="text-4xl md:text-5xl font-display font-bold text-white">
                  {measure.figure}
                </span>
                <span className="text-sm text-neutral-400 text-center max-w-xs">
                  {measure.key}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 animate-in ${visible ? "visible" : ""}`}
            style={{ animationDelay: "500ms" }}
          >
            <Link
              href="/contact"
              className="btn-primary btn-lg w-full sm:w-auto"
            >
              Start a Conversation
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/console"
              className="btn-secondary btn-lg w-full sm:w-auto"
            >
              Open Console
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </Link>
          </div>

          {/* Trust indicators */}
          <div
            className={`mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 animate-in ${visible ? "visible" : ""}`}
            style={{ animationDelay: "600ms" }}
          >
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-accent-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Local-first — data never leaves your device
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-accent-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Works offline by default
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-accent-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Built in Kirinyaga, Kenya
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce-subtle" aria-hidden="true">
          <svg className="h-6 w-6 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}