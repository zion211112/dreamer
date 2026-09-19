"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DoorsModal from "../../components/DoorsModal";
import JoinLink from "../../components/JoinLink";
import {
  KEYS,
  Member,
  SCHOOL_STATS,
  SEED_MEMBERS,
  SUBSCRIBED_SCHOOLS,
  TREASURY,
  loadStored
} from "../../lib/ledger";
import { SEED_BUILDS, mergeBuilds } from "../../lib/benben";

// Portal: the indigo→sky gradient landing. One artwork (the glass rings),
// one data wall (the glass snapshot cards), four doors for the unlocked.
// Figures come from the same ledger data the app renders — the landing
// never carries its own copy of a count.
const STUDENTS_UNDER_ROOF = SCHOOL_STATS.reduce((n, s) => n + s.students, 0);

export default function Home() {
  const [doors, setDoors] = useState(false);
  // Live figures: seed totals until the local roll/floor are read.
  const [names, setNames] = useState(SEED_MEMBERS.length);
  const [floor, setFloor] = useState(SEED_BUILDS.length);
  // The ledger doors only surface to visitors who have unlocked the app.
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const stored = loadStored<Member>(KEYS.members);
    if (stored.length > 0) setNames(stored.length);
    setFloor(mergeBuilds().length);
    try {
      setUnlocked(!!window.localStorage.getItem("apt_pilot_access"));
    } catch {
      /* memory */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll<HTMLElement>(".theme-portal .count-num").forEach((el) => {
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
    <main className="theme-portal">
      <section className="hero">
        <div className="dot-grid" aria-hidden="true" />
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">Kirinyaga, Kenya · The ledger</p>
            <h1 className="display hero-title">
              We&apos;re making a <span className="grad">list.</span>
            </h1>
            <p className="hero-sub">
              Of everyone in Kirinyaga who can actually do things. That&apos;s the whole company.
            </p>
            <div className="hero-actions">
              <button onClick={() => setDoors(true)} className="btn btn-ghost">
                Access build capacity
              </button>
              <JoinLink className="btn btn-solid">Join the ledger</JoinLink>
            </div>
            <p className="hero-count">
              <span className="dot-live" aria-hidden="true" />
              <span className="count-num" data-target="1">0</span>&nbsp;on the list. You&apos;re next.
            </p>
          </div>
          <div className="rings" aria-hidden="true">
            <span className="ring ring-lg" />
            <span className="ring ring-md" />
            <span className="ring ring-sm" />
          </div>
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
          <dl className="glass-grid">
            <div className="glass">
              <dt>Schools involved</dt>
              <dd><span className="count-num" data-target={SUBSCRIBED_SCHOOLS.length}>0</span></dd>
            </div>
            <div className="glass">
              <dt>Students under them</dt>
              <dd><span className="count-num" data-target={STUDENTS_UNDER_ROOF}>0</span></dd>
            </div>
            <div className="glass">
              <dt>Individuals on the ledger</dt>
              <dd><span className="count-num" data-target={names}>0</span></dd>
            </div>
            <div className="glass">
              <dt>Build budget used</dt>
              <dd>
                <span>KES {Math.round(TREASURY.total / 1000)}K</span>
                <span className="chip">{TREASURY.usedPct}% used</span>
              </dd>
            </div>
            <div className="glass">
              <dt>Builds on the floor</dt>
              <dd><span className="count-num" data-target={floor}>0</span></dd>
            </div>
            <div className="glass">
              <dt>Current build</dt>
              <dd>
                <span>Active</span>
                <span className="chip chip-live">pending</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Ledger entry points: only shown to visitors who have unlocked the app */}
      {unlocked && (
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
      )}

      {doors && <DoorsModal onClose={() => setDoors(false)} />}
    </main>
  );
}