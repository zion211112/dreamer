"use client";

// The Protocol Node — the product, mounted at "/".
//
// A local-first demonstration surface: it renders the control plane as an
// interface (contribution → proposal → allocation → execution → evidence →
// record) with every record labelled proposed, prototype, recorded or
// illustrative. Nothing here is a deployment claim, a shared server, or a
// beneficiary count.
//
// Visual program: an instrument ledger. One large statement per view, a spine
// down the content margin, hairlines as the only material, tabular numerals,
// one interactive accent. The console is a *build* inside the product track —
// not a sibling destination — so it is presented within this surface.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  BENBEN_BUILDS,
  EVIDENCE_SNAPSHOT,
  INTAKE,
  ORGANIZATION_RECORD,
  STATUS_LEDGER,
} from "@/lib/company";

export type PnView =
  | "overview"
  | "identity"
  | "contributions"
  | "proposals"
  | "juries"
  | "pools"
  | "writeup"
  | "assets"
  | "roll"
  | "audit";

export const PROTOCOL_HOME = "/";

/** Control plane — what the node decides with. */
const CONTROL: { view: PnView; label: string; index: string }[] = [
  { view: "overview", label: "Overview", index: "01" },
  { view: "identity", label: "Identity", index: "02" },
  { view: "contributions", label: "Contributions", index: "03" },
  { view: "proposals", label: "Proposals", index: "04" },
  { view: "juries", label: "Juries", index: "05" },
  { view: "pools", label: "Allocation pools", index: "06" },
];

/** Execution — what the node runs on, and what it hands over. */
const EXECUTION: { view: PnView; label: string; index: string }[] = [
  { view: "writeup", label: "The write-up", index: "07" },
  { view: "assets", label: "Assets", index: "08" },
  { view: "roll", label: "The Roll", index: "09" },
  { view: "audit", label: "Audit", index: "10" },
];

const VIEW_TITLES: Record<PnView, string> = {
  overview: "Overview",
  identity: "Identity",
  contributions: "Contributions",
  proposals: "Proposals",
  juries: "Juries",
  pools: "Allocation pools",
  writeup: "The write-up",
  assets: "Assets",
  roll: "The Roll",
  audit: "Audit",
};

// The node owns "/", so it carries the rest of the information architecture.
// The console is deliberately absent: it is a build inside the write-up, not a
// peer destination.
const SUPPORT: { href: string; label: string; note: string }[] = [
  { href: "/roll", label: "Roll", note: "substrate" },
  { href: "/about", label: "About", note: "doctrine" },
  { href: "/evidence", label: "Evidence", note: "boundary" },
  { href: "/contact", label: "Contact", note: "engagement" },
];

/** The loop, in the order it is walked. */
const LOOP = [
  "Contribution recorded",
  "Proposal under an explicit rule",
  "Allocation by formula",
  "Physical execution",
  "Evidence appended",
  "The record survives",
];

const LOOP_LINE =
  "Person → contribution → proposal → allocation → execution → evidence → record";

/** Evidence states are stored uppercase; the surface speaks title case. */
const STATE_WORD = (state: string) =>
  state.charAt(0) + state.slice(1).toLowerCase();

/** The hash is the router: #writeup is a deep link and back/forward works. */
function hashView(hash: string, views: string[]): PnView {
  const key = hash.replace(/^#\/?/, "");
  return views.includes(key) ? (key as PnView) : "overview";
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function exportName(view: PnView, at: Date): string {
  const day = at.toISOString().slice(0, 10).replace(/-/g, "");
  return `apt-labs-node-${view}-${day}.json`;
}

type Rec = {
  id: string;
  title: string;
  type: string;
  copy: string;
  state: string;
  tint?: string;
};
type Jury = { id: string; sub: string; meta: string; state: string; tint: string };
type CardRec = {
  meta: string;
  state: string;
  title: string;
  copy: string;
  footL: string;
  footR: string;
  gold?: boolean;
};
type Trace = { key: string; msg: string; state: string; tint: string };

// One source for the node's illustrative data: the views render it and the
// export serialises it. Each section declares its own state, and every record
// keeps the label of the section it sits in — nothing here is a claim.
const NODE = {
  identity: [
    { id: "ID-01", title: "Local participation credential", type: "Presence / contribution", copy: "Proves a defined eligibility condition without exposing every underlying attribute.", state: "Proposed" },
    { id: "ID-02", title: "Skill credential", type: "APT Studio / learning", copy: "Links a verified skill or completed task to an issuer and an evidence bundle.", state: "Proposed" },
    { id: "ID-03", title: "Contributor credential", type: "The Roll / attribution", copy: "Connects a contribution to a person, a time, a scope and supporting evidence.", state: "Prototype" },
  ] as Rec[],
  contributions: [
    { id: "C-109", title: "Water node maintenance", type: "APT Fab / field work", copy: "Maintenance event linked to an asset with service record and verifier signature.", state: "Recorded", tint: "recorded" },
    { id: "C-108", title: "Local compute setup", type: "APT Studio / node work", copy: "Node provisioning and technical handover record.", state: "Recorded", tint: "recorded" },
    { id: "C-107", title: "Supply-chain mediation", type: "Civic process / dispute", copy: "Resolution record with roles, evidence bundle and appeal window.", state: "Review", tint: "review" },
  ] as Rec[],
  assets: [
    { id: "AF-014", title: "Solar service node", type: "APT Fab / energy", copy: "BOM, sourcing record, installer record and acceptance checklist linked.", state: "Planned" },
    { id: "AS-007", title: "Creative compute node", type: "APT Studio / compute", copy: "Hardware inventory and node test record available; installation remains scoped.", state: "Fabricated" },
    { id: "BB-003", title: "School Console", type: "BenBen Builds / software", copy: "Local prototype; no verified school deployment.", state: "Prototype" },
  ] as Rec[],
  juries: [
    { id: "J-009", sub: "Solar service node siting", meta: "6 seats · 9-day term · eligibility proof required", state: "Selected", tint: "live" },
    { id: "J-008", sub: "Supply-chain dispute", meta: "5 seats · 5-day term · decision recorded", state: "Concluded", tint: "neutral" },
    { id: "J-007", sub: "Compute allocation review", meta: "7 seats · 7-day term · conflicts disclosed", state: "Appeal", tint: "gold" },
  ] as Jury[],
  proposals: [
    { meta: "PR-014", state: "Open", title: "Where should the next service node go?", copy: "Scope, eligibility, allocation pool, implementation constraints and the evidence checklist published together.", footL: "Allocation rule / candidate", footR: "9d remaining" },
    { meta: "PR-013", state: "Review", title: "Approve a community compute expansion.", copy: "Capacity, maintenance burden, procurement record and operator plan exposed before the decision.", footL: "Decision / mixed", footR: "Appeal open", gold: true },
  ] as CardRec[],
  pools: [
    { meta: "POOL-014", state: "Pending", title: "Solar service node", copy: "Deployment candidate with explicit release conditions and an evidence checklist.", footL: "KSh 420K illustrative", footR: "Release pending" },
    { meta: "POOL-013", state: "Review", title: "Local compute node", copy: "Expansion candidate with hardware, power, maintenance and operator requirements.", footL: "KSh 300K illustrative", footR: "Review", gold: true },
  ] as CardRec[],
  transitions: [
    { key: "00:12:41", msg: "Contribution C-109 linked to asset AF-014", state: "Sealed", tint: "signed" },
    { key: "00:09:20", msg: "Jury J-009 selection proof published", state: "Published", tint: "published" },
    { key: "23:51:02", msg: "Pool POOL-014 threshold recalculated", state: "Recorded", tint: "recorded" },
    { key: "23:44:19", msg: "Asset AF-014 evidence bundle appended", state: "Hashed", tint: "hashed" },
  ] as Trace[],
  audit: [
    { key: "T-08", msg: "Credential recorded after contribution evidence", state: "Sealed", tint: "signed" },
    { key: "T-07", msg: "Proposal rule version updated before opening", state: "Recorded", tint: "recorded" },
    { key: "T-06", msg: "Jury conflict disclosure appended", state: "Published", tint: "published" },
    { key: "T-05", msg: "Pool disbursement withheld pending evidence", state: "Blocked", tint: "blocked" },
  ] as Trace[],
};

/** Execution surfaces — read from the runtime truth module, never retyped. */
const SURFACES = [
  ...STATUS_LEDGER.map((r) => ({ name: r.face, path: r.route, state: r.status })),
  { name: BENBEN_BUILDS.name, path: BENBEN_BUILDS.route, state: BENBEN_BUILDS.status },
];

/** One descriptive line per surface. A description, not a claim. */
const SURFACE_PROSE: Record<string, string> = {
  "APT Fab": "Requirement → design → BOM → source → fabricate → install → repair.",
  "APT Studio": "Local compute, credential operations, node maintenance and recovery.",
  "The Roll": "People and asset registers, sealed with the same trust model.",
  "BenBen Builds": "Practical ideas become working products on the node's evidence rules.",
};

/** The product track, and the build that demonstrates it. */
const BUILD = BENBEN_BUILDS;
const EXAMPLE = BENBEN_BUILDS.products[0];

/** Trace state → the tint class it wears. Written out, so none can be typo'd. */
const TRACE_TONE: Record<string, string> = {
  signed: "pn-auditstate--signed",
  published: "pn-auditstate--published",
  recorded: "pn-auditstate--recorded",
  hashed: "pn-auditstate--hashed",
  blocked: "pn-auditstate--blocked",
};

function exportRecords(view: PnView): unknown[] {
  switch (view) {
    case "identity": return NODE.identity;
    case "contributions": return NODE.contributions;
    case "assets": return NODE.assets;
    case "juries": return NODE.juries;
    case "proposals": return NODE.proposals;
    case "pools": return NODE.pools;
    case "roll": return NODE.transitions;
    case "audit": return NODE.audit;
    case "writeup": return [...EVIDENCE_SNAPSHOT, ...ORGANIZATION_RECORD];
    default: return [...SURFACES, ...LOOP];
  }
}

export default function ProtocolNode() {
  const [view, setView] = useState<PnView>("overview");
  const [saved, setSaved] = useState("");

  // The active view is URL state, not component state: #writeup is a real deep
  // link and the back button steps through the control plane.
  useEffect(() => {
    const views = Object.keys(VIEW_COMPONENTS);
    const read = () => hashView(window.location.hash, views);
    setView(read());
    const onHash = () => {
      setView(read());
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Scroll progress — one signal hairline under the topbar.
  useEffect(() => {
    const bar = document.querySelector<HTMLElement>(".pn-progress");
    if (!bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Choreographed entrance: each block rises in as it reaches the
  // viewport, staggered by its position in the view. Re-runs on every
  // view change because the active view remounts fresh DOM.
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".pn-view.is-active");
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (els.length === 0) return;
    if (prefersReducedMotion()) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("in");
          io.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el, i) => {
      el.style.setProperty("--r", String(Math.min(i, 5)));
      io.observe(el);
    });
    return () => io.disconnect();
  }, [view]);

  // Local-first: nothing leaves this device, so "export" is the honest verb.
  // The control writes a JSON snapshot of the surface to this machine.
  const exportView = useCallback(() => {
    const at = new Date();
    const name = exportName(view, at);
    const payload = {
      surface: "APT-LABS protocol node",
      state: "PROTOTYPE",
      view: VIEW_TITLES[view],
      exportedAt: at.toISOString(),
      loop: LOOP_LINE,
      boundary:
        "Local export of a prototype surface. Records are illustrative; this file is not a deployment, beneficiary or impact claim.",
      records: exportRecords(view),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    URL.revokeObjectURL(url);
    setSaved(`Saved ${name}`);
    window.setTimeout(() => setSaved(""), 5000);
  }, [view]);

  return (
    <div className="protocol-node">
      <div className="pn-shell">
        {/* ── Instrument panel ── */}
        <aside className="pn-side" aria-label="Protocol node">
          <Link className="pn-brand" href={PROTOCOL_HOME}>
            <span className="pn-mark" aria-hidden="true">A</span>
            <span>APT-LABS</span>
          </Link>

          <div className="pn-node">
            <small>Protocol node</small>
            <strong>Kirinyaga / 01</strong>
            <div className="pn-live">
              <span>Local node interface</span>
              <span className="pn-clock">Prototype</span>
            </div>
          </div>

          <div className="pn-navlabel" id="pn-grp-control">Control plane</div>
          <nav className="pn-navgroup" aria-labelledby="pn-grp-control">
            {CONTROL.map((n) => (
              <a
                key={n.view}
                href={`#${n.view}`}
                className="pn-nav"
                aria-current={view === n.view ? "location" : undefined}
              >
                <span className="pn-nav-idx" aria-hidden="true">{n.index}</span>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="pn-navlabel" id="pn-grp-execution">Execution</div>
          <nav className="pn-navgroup" aria-labelledby="pn-grp-execution">
            {EXECUTION.map((n) => (
              <a
                key={n.view}
                href={`#${n.view}`}
                className="pn-nav"
                aria-current={view === n.view ? "location" : undefined}
              >
                <span className="pn-nav-idx" aria-hidden="true">{n.index}</span>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="pn-navlabel" id="pn-grp-routes">Support routes</div>
          <nav className="pn-navgroup pn-navgroup--routes" aria-labelledby="pn-grp-routes">
            {SUPPORT.map((s) => (
              <Link key={s.href} href={s.href} className="pn-route">
                <span className="pn-route-label">{s.label}</span>
                <span className="pn-route-note" aria-hidden="true">{s.note}</span>
              </Link>
            ))}
          </nav>

          <div className="pn-foot">
            Opt-in civic infrastructure
            <br />
            Local-first / evidence-first
            <br />
            Protocol state / prototype
            <Link className="pn-footlink" href="/contact">Talk to APT-LABS →</Link>
          </div>
        </aside>

        {/* ── Record column ── */}
        <main className="pn-main">
          <div className="pn-top">
            <span className="pn-progress" aria-hidden="true" />
            <div className="pn-crumb">
              <i>APT-LABS</i> / <b>{VIEW_TITLES[view]}</b>
            </div>
            <div className="pn-nodeid" aria-hidden="true">
              <span>Kirinyaga / 01</span>
              <span className="pn-nodeid-dot" />
              <span>Local</span>
            </div>
            <div className="pn-topactions">
              <span className="pn-status" role="status" aria-live="polite">
                {saved || "Local node · illustrative records"}
              </span>
              <button
                type="button"
                className={`pn-topbtn${saved ? " is-saved" : ""}`}
                onClick={exportView}
              >
                Export view
              </button>
            </div>
          </div>

          <div className="pn-content">
            <ViewShell active={view} />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* View router                                                      */
/* ---------------------------------------------------------------- */

const VIEW_COMPONENTS: Record<PnView, React.ComponentType> = {
  overview: OverviewView,
  identity: IdentityView,
  contributions: ContributionsView,
  proposals: ProposalsView,
  juries: JuriesView,
  pools: PoolsView,
  writeup: WriteupView,
  assets: AssetsView,
  roll: RollView,
  audit: AuditView,
};

function ViewShell({ active }: { active: PnView }) {
  const Active = VIEW_COMPONENTS[active];
  return (
    <section
      id={`pn-v-${active}`}
      className="pn-view is-active"
      role="region"
      aria-label={VIEW_TITLES[active]}
    >
      <Active />
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* 01 · Overview                                                    */
/* ---------------------------------------------------------------- */

function OverviewView() {
  return (
    <>
      <Command
        eyebrow="01 / Overview"
        title="The node is the record."
        copy="One control plane closes the loop from a person's contribution to the evidence that survives it. Everything on this surface is a prototype, and every record says so."
        specs={[
          ["Mode", "Prototype"],
          ["Records", "Illustrative"],
          ["Storage", "This browser"],
          ["Export", "Local JSON"],
        ]}
      />

      <div className="pn-pulse" data-reveal role="group" aria-label="Protocol state">
        <div className="pn-pulse-main">
          <div className="eyebrow">Protocol loop</div>
          <strong>{LOOP_LINE}</strong>
        </div>
        <div className="pn-pulse-cell"><small>Mode</small><b>Prototype</b></div>
        <div className="pn-pulse-cell"><small>Records</small><b>Illustrative</b></div>
        <div className="pn-pulse-cell"><small>Storage</small><b>This browser</b></div>
        <div className="pn-pulse-cell"><small>Export</small><b>Local JSON</b></div>
      </div>

        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>The loop, in order</h2>
          <span>Six transitions</span>
        </div>
        <div className="pn-loop" role="list">
          {LOOP.map((step, i) => (
            <div className="pn-loop-row" role="listitem" key={step}>
              <span className="pn-loop-key" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <b>{step}</b>
            </div>
          ))}
        </div>
      </div>

        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Topology</h2>
          <span>Prototype</span>
        </div>
        <div className="pn-grid2">
          <div
            className="pn-map"
            role="img"
            aria-label="Node topology: the protocol node at the centre, with APT Fab, APT Studio, BenBen Builds and The Roll around it."
          >
            <i className="pn-link pn-link--1" aria-hidden="true" />
            <i className="pn-link pn-link--2" aria-hidden="true" />
            <i className="pn-link pn-link--3" aria-hidden="true" />
            <i className="pn-link pn-link--4" aria-hidden="true" />
            <div className="pn-core" />
            <div className="pn-core-label">Protocol<br />node</div>
            <div className="pn-mnode pn-mnode--1 pn-mnode--live"><small>01</small><b>APT Fab</b></div>
            <div className="pn-mnode pn-mnode--2 pn-mnode--live"><small>02</small><b>APT Studio</b></div>
            <div className="pn-mnode pn-mnode--3 pn-mnode--review"><small>03</small><b>BenBen Builds</b></div>
            <div className="pn-mnode pn-mnode--4"><small>04</small><b>The Roll</b></div>
          </div>
          <div className="pn-panel">
            <div className="pn-panelhead">
              <span>Execution surfaces</span>
              <strong>Prototype</strong>
            </div>
            <div className="pn-surfaces">
              {SURFACES.map((s) => (
                <div className="pn-surface" key={s.name}>
                  <span className="pn-surface-name">{s.name}</span>
                  <span className="pn-surface-note">{SURFACE_PROSE[s.name]}</span>
                  <span className="pn-surface-state">{STATE_WORD(s.state)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 02 · Identity                                                    */
/* ---------------------------------------------------------------- */

function IdentityView() {
  return (
    <>
      <Command
        eyebrow="02 / Identity"
        title="Who is eligible, and why."
        copy="Identity is separated from power. A credential proves a defined eligibility condition; policy decides what that condition unlocks. These objects are proposed — none is issued."
        specs={[
          ["Objects", "3"],
          ["Issued", "0"],
          ["Policy", "Explicit"],
          ["Influence", "Bounded"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Credential objects</h2>
          <span>Prototype policy</span>
        </div>
        <Registry
          rows={NODE.identity}
          evidence="Issuer or witness record for the claimed attribute, plus the disclosure scope."
        />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 03 · Contributions                                               */
/* ---------------------------------------------------------------- */

function ContributionsView() {
  return (
    <>
      <Command
        eyebrow="03 / Contributions"
        title="Work is recorded before it is rewarded."
        copy="A contribution is an event with a person, a time, a scope and a linked asset. Nothing here is paid, scored or ranked: the record only has to be reconstructable."
        specs={[
          ["Events", "Illustrative"],
          ["Attribution", "Explicit"],
          ["Payment", "None"],
          ["Scoring", "None"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Contribution events</h2>
          <span>Illustrative records</span>
        </div>
        <Registry
          rows={NODE.contributions}
          tinted
          evidence="Issuer or witness signature, the contributing person, the linked asset and the event timestamp."
        />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 04 · Proposals                                                   */
/* ---------------------------------------------------------------- */

function ProposalsView() {
  return (
    <>
      <Command
        eyebrow="04 / Proposals"
        title="Every decision ships with its rule."
        copy="A proposal publishes its scope, its eligibility, its allocation rule and the evidence checklist in the same breath. If the rule is not written down, the proposal does not open."
        specs={[
          ["Open", "1"],
          ["In review", "1"],
          ["Rule", "Published"],
          ["Reversal", "Appeal window"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Open proposals</h2>
          <span>Explicit rules</span>
        </div>
        <div className="pn-cards">
          {NODE.proposals.map((p) => (
            <Card key={p.meta} {...p} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 05 · Juries                                                      */
/* ---------------------------------------------------------------- */

function JuriesView() {
  return (
    <>
      <Command
        eyebrow="05 / Juries"
        title="Selection is a proof, not a guess."
        copy="Juries are drawn by sortition. The draw is published, terms are bounded, conflicts are disclosed and an appeal is always available — a capture alert rather than an automatic penalty."
        specs={[
          ["Panels", "3"],
          ["Method", "Sortition"],
          ["Terms", "Bounded"],
          ["Appeal", "Always"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Sortition panels</h2>
          <span>Illustrative</span>
        </div>
        <div className="pn-jury" role="list">
          {NODE.juries.map((j) => (
            <div className="pn-juryrow" role="listitem" key={j.id}>
              <span className="pn-jid">{j.id}</span>
              <div>
                <div className="pn-jsub">{j.sub}</div>
                <div className="pn-jmeta">{j.meta}</div>
              </div>
              <span
                className={`pn-jstate${
                  j.tint === "live" ? " pn-jstate--live" : j.tint === "gold" ? " pn-jstate--gold" : ""
                }`}
              >
                {j.state}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 06 · Allocation pools                                            */
/* ---------------------------------------------------------------- */

function PoolsView() {
  return (
    <>
      <Command
        eyebrow="06 / Allocation pools"
        title="Money moves by formula, in the open."
        copy="A pool states its sources, its threshold and its release conditions before anything is disbursed. Funding quadratic rather than linear is a policy choice the pool exposes, not a hidden hand."
        specs={[
          ["Pool", "POOL-014"],
          ["Rule", "Candidate"],
          ["Disbursed", "KSh 0"],
          ["Release", "Evidence-bound"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Pool candidates</h2>
          <span>Prototype economics</span>
        </div>
        <div className="pn-cards">
          {NODE.pools.map((p) => (
            <Card key={p.meta} {...p} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 07 · The write-up (product track + the console as its example)   */
/* ---------------------------------------------------------------- */

function WriteupView() {
  return (
    <>
      <Command
        eyebrow="07 / The write-up"
        title="What is built, and what is not."
        copy="A short account of the system, its evidence, and the claims it deliberately does not make. The console is a build inside this track — it opens from here."
        specs={[
          ["Track", BUILD.name],
          ["Example", EXAMPLE.name],
          ["State", STATE_WORD(EXAMPLE.status)],
          ["Intake", INTAKE.route],
        ]}
      />

      <div className="pn-thesis" data-reveal>
        <div className="pn-thesis-index">01 / Thesis</div>
        <p>
          Institutions decide, spend and build — then lose the thread of who was
          eligible, which rule applied, where the money went, and what survives as
          evidence. This node keeps that thread on the device it runs on. A hash
          can show that a record changed; it cannot make a record true. So the
          surface states what it knows, and states what it does not.
        </p>
      </div>

        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>The record</h2>
          <span>Every line carries a state</span>
        </div>
        <div className="pn-grid2">
          <div>
            <div className="eyebrow">Evidenced</div>
            <div className="pn-ledger">
              {EVIDENCE_SNAPSHOT.map((row) => (
                <div className="pn-ledger-row" key={row.label}>
                  <span className="pn-ledger-key">{row.label}</span>
                  <b>{row.value}</b>
                  <p>{STATE_WORD(row.state)}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="eyebrow">Not yet evidenced</div>
            <div className="pn-ledger">
              {ORGANIZATION_RECORD.map((row) => (
                <div className="pn-ledger-row" key={row.label}>
                  <span className="pn-ledger-key">{row.label}</span>
                  <b>{row.value}</b>
                  <p>{STATE_WORD(row.state)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>{BUILD.name}</h2>
          <span>{BUILD.role}</span>
        </div>
        <div className="pn-builds">
          <article className="pn-build">
            <div className="pn-build-top">
              <span className="pn-build-idx" aria-hidden="true">01</span>
              <h3 className="pn-build-name">{BUILD.name}</h3>
              <span className="pn-build-role">{BUILD.role}</span>
              <span className="pn-build-state">{STATE_WORD(BUILD.status)}</span>
            </div>
            <p className="pn-build-body">{BUILD.summary}</p>
            <div className="pn-build-foot">
              <span>
                Intake <b>{INTAKE.route}</b>
              </span>
              <span>
                Evidence <b>{EXAMPLE.evidenceRefs.join(", ")}</b>
              </span>
            </div>

            <div className="pn-example">
              <div className="pn-example-head">
                <span className="pn-example-mark" aria-hidden="true">SC</span>
                <h4>{EXAMPLE.name}</h4>
                <span className="pn-build-state">{STATE_WORD(EXAMPLE.status)}</span>
              </div>
              <p>{EXAMPLE.oneLine}</p>
              <dl className="pn-example-facts">
                <div>
                  <dt>Boundary</dt>
                  <dd>{EXAMPLE.boundary}</dd>
                </div>
                <div>
                  <dt>Evidence</dt>
                  <dd>{EXAMPLE.evidenceRefs.join(", ")}</dd>
                </div>
                <div>
                  <dt>Runs</dt>
                  <dd>On this device, offline-first</dd>
                </div>
              </dl>
              <div className="pn-actions">
                <Link className="pn-action pn-action--primary" href={EXAMPLE.route}>
                  Open the console <span aria-hidden="true">→</span>
                </Link>
                <Link className="pn-action" href={EXAMPLE.floorRoute}>
                  Open the Floor intake
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 08 · Assets                                                      */
/* ---------------------------------------------------------------- */

function AssetsView() {
  return (
    <>
      <Command
        eyebrow="08 / Assets"
        title="Every asset carries its own state."
        copy="An asset is planned, fabricated, installed, tested or accepted — and each step has a record behind it. A missing step is shown as a missing step, never smoothed over."
        specs={[
          ["Register", "The Roll / assets"],
          ["Ladder", "Planned → Verified"],
          ["Seal", "SHA-256"],
          ["Deployment", "None verified"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Asset register</h2>
          <span>The Roll / asset side</span>
        </div>
        <Registry
          rows={NODE.assets}
          evidence="BOM or build record, source note, installer or handover record and the acceptance checklist."
        />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 09 · The Roll                                                    */
/* ---------------------------------------------------------------- */

function RollView() {
  return (
    <>
      <Command
        eyebrow="09 / The Roll"
        title="One ledger, two registers."
        copy="The Roll is the substrate: people on one side, assets on the other, sealed by the same discipline. These entries are illustrative — no shared register is published."
        specs={[
          ["Registers", "2"],
          ["Entries", "Illustrative"],
          ["Seal", "SHA-256"],
          ["Server", "None"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Recent transitions</h2>
          <span>Illustrative</span>
        </div>
        <div className="pn-auditlist" role="list">
          {NODE.transitions.map((r) => (
            <div className="pn-auditrow" role="listitem" key={r.key}>
              <span>{r.key}</span>
              <b>{r.msg}</b>
              <span className={`pn-auditstate ${TRACE_TONE[r.tint]}`}>{r.state}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 10 · Audit                                                       */
/* ---------------------------------------------------------------- */

function AuditView() {
  const principles: [string, string][] = [
    ["Explicit policy", "Any rule that moves money or influence is written down before it runs."],
    ["Bounded influence", "Identity buys eligibility, never weight. Nothing escalates on its own."],
    ["Visible incompleteness", "A missing record stays missing. A gap is never filled with a plausible number."],
  ];
  return (
    <>
      <Command
        eyebrow="10 / Audit"
        title="High-impact moves leave a trace."
        copy="Every state change that touches money, eligibility or evidence is written to the trace with its actor, its rule and its reason — including the moves that were refused."
        specs={[
          ["Trace", "Append-only"],
          ["Refusal", "Recorded"],
          ["Escalation", "Manual"],
          ["Capture", "Alert, not slash"],
        ]}
      />
        <div className="pn-section" data-reveal>
        <div className="pn-sectionhead">
          <h2>Transition trace</h2>
          <span>Illustrative</span>
        </div>
        <div className="pn-audit">
          <div className="pn-auditlist" role="list">
            {NODE.audit.map((r) => (
              <div className="pn-auditrow" role="listitem" key={r.key}>
                <span>{r.key}</span>
                <b>{r.msg}</b>
                <span className={`pn-auditstate ${TRACE_TONE[r.tint]}`}>{r.state}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="eyebrow">Held by design</div>
            <div className="pn-principles">
              {principles.map(([label, body]) => (
                <div className="pn-principle" key={label}>
                  <b>{label}</b>
                  {body}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Reusable pieces                                                  */
/* ---------------------------------------------------------------- */

function Command({
  eyebrow,
  title,
  copy,
  specs,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  specs: [string, string][];
}) {
  return (
    <div className="pn-command" data-reveal>
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <div className="pn-specs">
        {specs.map(([k, v]) => (
          <div className="pn-spec" key={k}>
            <small>{k}</small>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Registry({
  rows,
  tinted,
  evidence,
}: {
  rows: Rec[];
  tinted?: boolean;
  /** The evidence a record in this register must carry to leave "illustrative". */
  evidence: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="pn-registry" role="list" aria-label="Protocol object register">
      {rows.map((r) => {
        const detailId = `pn-detail-${r.id}`;
        const isOpen = open === r.id;
        return (
          <div
            key={r.id}
            role="listitem"
            className={`pn-record${r.tint && tinted ? ` pn-state--${r.tint}` : ""}`}
          >
            <div className="pn-row">
              <div className="pn-rowid">{r.id}</div>
              <div>
                <div className="pn-rowtitle">{r.title}</div>
                <div className="pn-rowtype">{r.type}</div>
              </div>
              <div className="pn-rowcopy">{r.copy}</div>
              <div className="pn-state">{r.state}</div>
              <button
                type="button"
                className="pn-open"
                aria-expanded={isOpen}
                aria-controls={detailId}
                onClick={() => setOpen(isOpen ? null : r.id)}
                aria-label={`${isOpen ? "Hide" : "Show"} fields for record ${r.id}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
            {isOpen && (
              <dl className="pn-rowdetail" id={detailId}>
                <div className="pn-field">
                  <dt>Record</dt>
                  <dd>
                    {r.id} · {r.type}
                  </dd>
                </div>
                <div className="pn-field">
                  <dt>State</dt>
                  <dd>{r.state} — illustrative, not a deployment claim</dd>
                </div>
                <div className="pn-field">
                  <dt>Evidence required</dt>
                  <dd>{evidence}</dd>
                </div>
              </dl>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Card({
  meta,
  state,
  title,
  copy,
  footL,
  footR,
  gold,
}: {
  meta: string;
  state: string;
  title: string;
  copy: string;
  footL: string;
  footR: string;
  gold?: boolean;
}) {
  return (
    <article className={`pn-card${gold ? " pn-card--gold" : ""}`}>
      <div className="pn-cardmeta">
        <span>{meta}</span>
        <span className="pn-cardmeta-state">{state}</span>
      </div>
      <h3>{title}</h3>
      <p>{copy}</p>
      <div className="pn-cardfoot">
        <span>{footL}</span>
        <span>{footR}</span>
      </div>
    </article>
  );
}
