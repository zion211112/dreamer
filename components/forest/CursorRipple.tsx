"use client";

import { useEffect, useRef } from "react";

// Cursor leaves a ripple trail through the grid. Restrained:
// one fading ring per pause, never on touch, never with reduced motion.
export default function CursorRipple() {
  const last = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last.current < 260) return;
      last.current = now;
      const d = document.createElement("span");
      d.className = "ripple-dot";
      d.style.left = `${e.clientX}px`;
      d.style.top = `${e.clientY}px`;
      document.body.appendChild(d);
      window.setTimeout(() => d.remove(), 2500);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return null;
}
