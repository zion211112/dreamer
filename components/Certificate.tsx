"use client";

import { useEffect, useRef, useState } from "react";
import { Member } from "../lib/ledger";

// A certificate you download, not a badge you wear.
// Obsidian ground, gold rules, twelve-cell geometry, kanga edge.
// Drawn by hand on canvas — zero image deps, zero ego.
export default function Certificate({ m, certNo, dateStr }: { m: Member; certNo: string; dateStr: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    async function draw() {
      try {
        await Promise.race([
          Promise.all([
            document.fonts.load('700 92px "Playfair Display"'),
            document.fonts.load('600 30px "Playfair Display"'),
            document.fonts.load('700 22px "JetBrains Mono"'),
            document.fonts.load('400 20px "JetBrains Mono"')
          ]),
          new Promise((r) => setTimeout(r, 1500))
        ]);
      } catch { /* fallback fonts carry it */ }
      if (!live) return;
      const cv = ref.current;
      if (!cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const W = 1200, H = 760;
      cv.width = W; cv.height = H;

      // ground
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, W, H);

      // kanga edge: stepped cloth bars, left
      const bars = ["#d4af37", "#8b3a2f", "#1a3c2a", "#d4af37", "#57534e"];
      bars.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, 90 + i * 118, 14, 76);
      });

      // gold double frame
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 3;
      ctx.strokeRect(48, 48, W - 96, H - 96);
      ctx.lineWidth = 1;
      ctx.strokeRect(60, 60, W - 120, H - 120);

      // stepped kente corners (drawn, original)
      ctx.fillStyle = "#d4af37";
      const corner = (x: number, y: number, sx: number, sy: number) => {
        for (let i = 0; i < 4; i++) ctx.fillRect(x + sx * i * 18, y + sy * i * 18, 18, 18);
      };
      corner(76, 76, 1, 1); corner(W - 94, 76, -1, 1); corner(76, H - 94, 1, -1); corner(W - 94, H - 94, -1, -1);

      // twelve-cell orbit, faint, top right
      ctx.strokeStyle = "rgba(212,175,55,0.28)";
      ctx.lineWidth = 1.5;
      const cx = 985, cy = 200, r = 95;
      ctx.beginPath(); ctx.arc(cx, cy, r + 38, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 12; i++) {
        const a = (Math.PI / 6) * i;
        ctx.beginPath(); ctx.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 11, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = "#d4af37";
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

      // cowrie row: carried, not crowned
      ctx.strokeStyle = "rgba(212,175,55,0.5)";
      for (let i = 0; i < 9; i++) {
        const x = 120 + i * 46;
        ctx.beginPath(); ctx.ellipse(x, H - 108, 13, 9, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 13, H - 108); ctx.lineTo(x + 13, H - 108); ctx.stroke();
      }

      // type
      ctx.fillStyle = "#a8a29e";
      ctx.font = '700 22px "JetBrains Mono", monospace';
      ctx.fillText("OSAWI INSTITUTE · CERTIFIED CAPABILITY", 120, 130);
      ctx.fillStyle = "#d4af37";
      ctx.font = '400 20px "JetBrains Mono", monospace';
      ctx.fillText(certNo, 120, 162);

      ctx.fillStyle = "#f5f0e6";
      ctx.font = '700 92px "Playfair Display", Georgia, serif';
      const name = m.name.length > 22 ? m.name.slice(0, 22) : m.name;
      ctx.fillText(name, 116, 280);

      ctx.fillStyle = "#d4af37";
      ctx.font = '700 30px "JetBrains Mono", monospace';
      ctx.fillText("@" + m.username, 120, 330);

      ctx.fillStyle = "#a8a29e";
      ctx.font = '400 24px "JetBrains Mono", monospace';
      ctx.fillText(`${m.id}  ·  ${m.occupation}  ·  ${m.location}`, 120, 380);
      ctx.fillText(`Skills: ${m.skills.join(" · ").slice(0, 64)}`, 120, 416);

      ctx.fillStyle = "#57534e";
      ctx.font = '400 19px "JetBrains Mono", monospace';
      const h1 = m.hash.slice(0, 40), h2 = m.hash.slice(40);
      ctx.fillText("hash " + h1, 120, 480);
      ctx.fillText("     " + h2, 120, 506);
      ctx.fillText(`Sealed ${dateStr} · Verify: /verify/${m.hash}`, 120, 548);

      ctx.fillStyle = "#a8a29e";
      ctx.font = '600 24px "Playfair Display", Georgia, serif';
      ctx.fillText("Carried, not crowned.", 120, H - 150);

      setReady(true);
    }
    draw();
    return () => { live = false; };
  }, [m, certNo, dateStr]);

  function download() {
    const cv = ref.current;
    if (!cv) return;
    const a = document.createElement("a");
    a.download = `${m.id}-certificate.png`;
    a.href = cv.toDataURL("image/png");
    a.click();
  }

  return (
    <div>
      <canvas ref={ref} className="w-full rounded-2xl border border-white/10" style={{ aspectRatio: "1200/760" }} />
      <button
        onClick={download}
        disabled={!ready}
        className="mt-4 w-full rounded-full bg-gold py-4 text-sm font-bold text-black hover:bg-ivory transition disabled:opacity-40"
      >
        {ready ? "Download certificate →" : "Inking…"}
      </button>
    </div>
  );
}
