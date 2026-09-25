"use client";

import { useEffect } from "react";

// Reveals [data-reveal] descendants once, on entry, honoring
// [data-reveal-delay="1..5"] stagger. The page stays fully rendered
// without JS; this only adds motion.
export function Reveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll(".sb [data-reveal]"));
    if (!targets.length) return;
    if (typeof IntersectionObserver === "undefined") {
      targets.forEach((el) => el.classList.add("visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return null;
}
