"use client";

import { useEffect } from "react";
import GeoArt from "../GeoArt";

// The {7,3} tiling as the hero's focal mark. It sits behind the hero
// layout (z 1) on a flat, near-transparent ground, and eases toward the
// cursor while the pointer is over the hero — the mark answers, it
// never chases: a low lerp factor keeps it two or three frames behind
// the pointer, so motion reads as drift, not tracking. Same guardrails
// as HeroGlow: fine pointers only, motion-safe only; everywhere else
// the hero keeps the mark at rest, centered.
export function HeroGeoart() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".sb-hero");
    if (!hero) return;
    if (typeof window.matchMedia === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The mark eases toward the cursor: pointer position p is lerped
    // toward the raw target t, and the offset rendered on the mark is
    // (p - rest) * 0.06 — a low factor, so the mark drifts a fraction
    // of the way the pointer moves, trailing it two or three frames.
    // Everywhere on leave / at idle it relaxes back to its rest home.
    const rest = () => ({
      x: hero.clientWidth * 0.62,
      y: hero.clientHeight * 0.48,
    });
    const home = rest();
    let tx = home.x;
    let ty = home.y;
    let px = tx;
    let py = ty;
    let running = false;
    let frame = 0;

    const apply = () => {
      const r = rest();
      hero.style.setProperty("--geo-x", `${((px - r.x) * 0.06).toFixed(2)}px`);
      hero.style.setProperty("--geo-y", `${((py - r.y) * 0.06).toFixed(2)}px`);
    };

    const tick = () => {
      frame = 0;
      px += (tx - px) * 0.055;
      py += (ty - py) * 0.055;
      if (Math.abs(tx - px) < 0.5 && Math.abs(ty - py) < 0.5) {
        px = tx;
        py = ty;
        apply();
        running = false;
        return;
      }
      apply();
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (!running && !frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = hero.getBoundingClientRect();
      tx = event.clientX - rect.left;
      ty = event.clientY - rect.top;
      hero.classList.add("geo-lit");
      kick();
    };

    const onLeave = () => {
      const h = rest();
      tx = h.x;
      ty = h.y;
      hero.classList.remove("geo-lit");
      kick();
    };

    const onResize = () => {
      const h = rest();
      tx = px = h.x;
      ty = py = h.y;
      apply();
      kick();
    };

    // Prime the mark at its rest position, then arm the loop.
    apply();
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <GeoArt variant="cells" className="sb-hero-geoart" />;
}
