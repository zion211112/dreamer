"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BenBenLink from "../components/BenBenLink";
import DoorsModal from "../components/DoorsModal";
import JoinLink from "../components/JoinLink";

// Portico: paper landing only. BenBen floor stays obsidian.
// Four doors, kept verbatim per spec: Individual / Builder / School / Everyone.
export default function Home() {
  const [doors, setDoors] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll<HTMLElement>(".theme-paper .count-num").forEach((el) => {
      const target = parseInt(el.getAttribute("data-target") || "0", 10) || 0;
      if (reduce || target === 0) {
        el.textContent = target.toLocaleString();
        return;
      }
      let start: number | null = null;
      const duration = 900;
      function step(ts: number) {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, []);

  return (
    <main className="theme-paper">
      <div className="wrap" style={{ paddingTop: 12, paddingBottom: 0 }}>
        <span className="entry-no">Kirinyaga, Kenya</span>
      </div>

      <section className="hero">
        <div className="wrap">
          <h1 className="display hero-title">We&apos;re making a list.</h1>
          <p className="hero-sub">
            Of everyone in Kirinyaga who can actually do things. That&apos;s the whole company.
          </p>
          <div className="hero-actions">
            <button onClick={() => setDoors(true)} className="btn btn-primary">
              Build capacity
            </button>
            <JoinLink className="btn btn-secondary">Join the ledger</JoinLink>
            <BenBenLink className="btn btn-secondary">BenBen</BenBenLink>
            <Link href="/zep-tepi" className="btn btn-secondary border border-white/15 bg-transparent text-ivory hover:border-gold hover:text-gold">
              ZepTepi
            </Link>
          </div>
          <p className="hero-count">
            <span className="dot-live" aria-hidden="true" />
            <span className="count-num" data-target="1">0</span>&nbsp;on the list. You&apos;re next.
          </p>
        </div>
      </section>

      <section className="snapshot" aria-label="Ledger snapshot">
        <div className="wrap">
          <div className="snapshot-head">
            <h2 className="display snapshot-title">The ledger, right now</h2>
            <span className="live-tag">
              <span className="dot-live" aria-hidden="true" />
              Live
            </span>
          </div>
          <dl className="ledger-rows">
            <div className="ledger-row">
              <dt>Schools involved</dt>
              <dd><span className="count-num" data-target="3">0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Students under them</dt>
              <dd><span className="count-num" data-target="1380">0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Individuals on the ledger</dt>
              <dd><span className="count-num" data-target="8">0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Build budget used</dt>
              <dd>KES 250K<span className="ochre-tag">70%</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Completed projects</dt>
              <dd><span className="count-num" data-target="5">0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Current build</dt>
              <dd>Active, pending</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="doors">
        <div className="wrap" />
      </section>

      {doors && <DoorsModal onClose={() => setDoors(false)} />}
    </main>
  );
}