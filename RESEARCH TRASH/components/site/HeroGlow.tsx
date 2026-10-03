"use client";

import { useEffect } from "react";

// Pointer-tracked aura inside .sb-hero. Fine pointers only, motion-safe
// only; everywhere else the hero stays exactly as rendered.
export function HeroGlow() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".sb-hero");
    const glow = document.querySelector<HTMLElement>(".sb-hero-glow");
    if (!hero || !glow) return;
    if (typeof window.matchMedia === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const place = () => {
      frame = 0;
      glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    };
    const onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      hero.classList.add("lit");
      if (!frame) frame = window.requestAnimationFrame(place);
    };
    const onLeave = () => hero.classList.remove("lit");
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="sb-hero-glow" aria-hidden="true" />;
}
