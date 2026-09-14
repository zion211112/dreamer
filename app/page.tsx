"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DoorsModal from "../components/DoorsModal";
import JoinLink from "../components/JoinLink";
import {
  KEYS,
  Member,
  SCHOOL_STATS,
  SEED_MEMBERS,
  SUBSCRIBED_SCHOOLS,
  TREASURY,
  loadStored
} from "../lib/ledger";
import { SEED_BUILDS, mergeBuilds } from "../lib/benben";

// Portico: paper landing only. BenBen floor stays obsidian.
// Four doors, kept verbatim per spec: Individual / Builder / School / Everyone.
// Snapshot figures come from the same data the ledger page renders —
// the landing never carries its own copy of a count.
const STUDENTS_UNDER_ROOF = SCHOOL_STATS.reduce((n, s) => n + s.students, 0);

export default function Home() {
  const [doors, setDoors] = useState(false);
  // Live figures: seed totals until the local roll/floor are read.
  const [names, setNames] = useState(SEED_MEMBERS.length);
  const [floor, setFloor] = useState(SEED_BUILDS.length);

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    if (stored.length > 0) setNames(stored.length);
    setFloor(mergeBuilds().length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  }, [names, floor]);

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
              Access build capacity
            </button>
            <JoinLink className="btn btn-secondary">Join the ledger</JoinLink>
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
              <dd><span className="count-num" data-target={SUBSCRIBED_SCHOOLS.length}>0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Students under them</dt>
              <dd><span className="count-num" data-target={STUDENTS_UNDER_ROOF}>0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Individuals on the ledger</dt>
              <dd><span className="count-num" data-target={names}>0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Build budget used</dt>
              <dd>KES {Math.round(TREASURY.total / 1000)}K<span className="ochre-tag">{TREASURY.usedPct}%</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Builds on the floor</dt>
              <dd><span className="count-num" data-target={floor}>0</span></dd>
            </div>
            <div className="ledger-row">
              <dt>Current build</dt>
              <dd>Active, pending</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="doors">
        <div className="wrap">
          <h2 className="display doors-title">Verify capacity. What can you do?</h2>
          <ul className="doors-list">
            <li className="door">
              <span className="door-label">Individual</span>
              <p className="door-copy">You have a CV? Nobody believes it.</p>
              <Link href="/ledger" className="door-link">Join now</Link>
            </li>
            <li className="door">
              <span className="door-label">Builder</span>
              <p className="door-copy">Already skilled? Get verified, then take on paid builds.</p>
              <Link href="/ledger" className="door-link">Get verified</Link>
            </li>
            <li className="door">
              <span className="door-label">School</span>
              <p className="door-copy">Board your school onto the ledger to accelerate dev.</p>
              <Link href="/ledger" className="door-link">Get verified</Link>
            </li>
            <li className="door">
              <span className="door-label">Everyone</span>
              <p className="door-copy">See the floor. Builds, votes, forks.</p>
              <Link href="/ledger" className="door-link">Get verified</Link>
            </li>
          </ul>
        </div>
      </section>

      {doors && <DoorsModal onClose={() => setDoors(false)} />}
    </main>
  );
}