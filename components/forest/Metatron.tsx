"use client";

import { useEffect } from "react";

// Three deterministic Metatron layers: 33% opacity each,
// 5 / 8 / 13 minutes per revolution, parallax on scroll.
function Layer({ circles, lines, cls, opacity }: { circles: number; lines: boolean; cls: string; opacity: number }) {
  const pts: [number, number][] = [];
  for (let ring = 0; ring < 3; ring++) {
    const n = ring === 0 ? 1 : 6;
    const r = [0, 90, 170][ring];
    for (let i = 0; i < n; i++) {
      const a = (Math.PI / 3) * i + ring * 0.3;
      pts.push([400 + r * Math.cos(a), 300 + r * Math.sin(a)]);
    }
  }
  void circles;
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className={cls} style={{ opacity }}>
      {lines &&
        pts.map((p, i) =>
          pts.slice(i + 1).map((q, j) => (
            <line key={`${i}-${j}`} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="#c8763c" strokeWidth="0.6" />
          ))
        )}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === 0 ? 26 : 15} fill="none" stroke={i % 2 ? "#1a7a5c" : "#c8763c"} strokeWidth="1" />
      ))}
      <circle cx={400} cy={300} r={205} fill="none" stroke="#e0a040" strokeWidth="0.8" strokeDasharray="3 6" />
    </svg>
  );
}

export default function Metatron() {
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY * 0.12;
        document.querySelectorAll(".metatron").forEach((el) => {
          (el as HTMLElement).style.transform = `translateY(${y}px)`;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="metatron" aria-hidden>
      <Layer circles={13} lines cls="spin-5" opacity={0.33} />
      <Layer circles={13} lines={false} cls="spin-8" opacity={0.33} />
      <Layer circles={13} lines cls="spin-13" opacity={0.33} />
    </div>
  );
}
