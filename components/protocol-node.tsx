"use client";

// The protocol node is a local-first demonstration surface. It renders the
// SNA control plane as an interface — contribution → allocation → execution
// → evidence — with every record labelled illustrative, proposed, or
// prototype. Nothing here is a deployment claim, a shared server, or a
// beneficiary count.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BENBEN_BUILDS, STATUS_LEDGER } from "@/lib/company";

export type PnView =
  | "overview"
  | "identity"
  | "contributions"
  | "proposals"
  | "juries"
  | "pools"
  | "assets"
  | "roll"
  | "audit";

/** Where the brand mark resolves when the node is mounted at a sub-route. */
export const PROTOCOL_HOME = "/";

const CONTROL: { view: PnView; label: string; glyph: string }[] = [
  { view: "overview",      label: "Overview",      glyph: "◈" },
  { view: "identity",      label: "Identity",      glyph: "◇" },
  { view: "contributions", label: "Contributions", glyph: "＋" },
  { view: "proposals",     label: "Proposals",     glyph: "□" },
  { view: "juries",        label: "Juries",        glyph: "∿" },
  { view: "pools",         label: "Allocation pools", glyph: "◎" },
];

const EXECUTION: { view: PnView; label: string; glyph: string }[] = [
  { view: "assets", label: "Assets",   glyph: "▣" },
  { view: "roll",   label: "The Roll", glyph: "⌁" },
  { view: "audit",  label: "Audit",    glyph: "≡" },
];

const VIEW_TITLES: Record<PnView, string> = {
  overview: "Overview",
  identity: "Identity",
  contributions: "Contributions",
  proposals: "Proposals",
  juries: "Juries",
  pools: "Allocation pools",
  assets: "Assets",
  roll: "The Roll",
  audit: "Audit",
};

// The node owns "/", so it has to carry the whole information architecture —
// the support routes included — not just its own nine views.
const SUPPORT: { href: string; label: string }[] = [
  { href: "/work",     label: "Work" },
  { href: "/roll",     label: "Roll" },
  { href: "/about",    label: "About" },
  { href: "/evidence", label: "Evidence" },
  { href: "/contact",  label: "Contact" },
];

/** The loop the system closes. Same wording as lib/company.ts. */
const LOOP =
  "Person → contribution → proposal → allocation → execution → evidence → record";

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

// One source for the node's illustrative data: the views render it, the export
// serialises it, and each section declares its own state. Records are labelled
// by the section they sit in — nothing here is a deployment claim.
const NODE = {
  identity: [
    { id: "ID-01", title: "Local participation credential", type: "Presence / contribution", copy: "Proves a defined eligibility condition without exposing every underlying attribute.", state: "Proposed" },
    { id: "ID-02", title: "Skill credential", type: "APT Studio / learning", copy: "Links a verified skill or completed task to an issuer and evidence bundle.", state: "Proposed" },
    { id: "ID-03", title: "Contributor credential", type: "The Roll / attribution", copy: "Connects a contribution to a person, time, scope and supporting evidence.", state: "Prototype" },
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
  /* NODE-DATA-B */
  juries: [
    { id: "J-009", sub: "Solar service node siting", meta: "6 seats · 9-day term · eligibility proof required", state: "Selected", tint: "live" },
    { id: "J-008", sub: "Supply-chain dispute", meta: "5 seats · 5-day term · decision recorded", state: "Concluded", tint: "neutral" },
    { id: "J-007", sub: "Compute allocation review", meta: "7 seats · 7-day term · conflicts disclosed", state: "Appeal", tint: "gold" },
  ] as Jury[],
  proposals: [
    { meta: "PR-014", state: "Open", title: "Where should the next service node go?", copy: "Scope, eligibility, allocation pool, implementation constraints and evidence checklist published together.", footL: "Allocation rule / candidate", footR: "9d remaining" },
    { meta: "PR-013", state: "Review", title: "Approve a community compute expansion.", copy: "Capacity, maintenance burden, procurement record and operator plan exposed before decision.", footL: "Decision / mixed", footR: "Appeal open", gold: true },
  ] as CardRec[],
  pools: [
    { meta: "POOL-014", state: "Pending", title: "Solar service node", copy: "Deployment candidate with explicit release conditions and evidence checklist.", footL: "KSh 420K illustrative", footR: "Release pending" },
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

/** Execution surfaces, read from the runtime truth module — never retyped. */
const SURFACES = [
  ...STATUS_LEDGER.map((r) => ({ name: r.face, path: r.route, state: r.status })),
  { name: BENBEN_BUILDS.name, path: BENBEN_BUILDS.route, state: BENBEN_BUILDS.status },
];

/** What "Export view" writes: the records themselves, never a rendered claim. */
function exportRecords(view: PnView): unknown[] {
  switch (view) {
    case "identity":      return NODE.identity;
    case "contributions": return NODE.contributions;
    case "assets":        return NODE.assets;
    case "juries":        return NODE.juries;
    case "proposals":     return NODE.proposals;
    case "pools":         return NODE.pools;
    case "roll":          return NODE.transitions;
    case "audit":         return NODE.audit;
    default:              return SURFACES;
  }
}

export default function ProtocolNode() {
  const [view, setView] = useState<PnView>("overview");
  const [saved, setSaved] = useState("");

  // The active view is URL state, not component state: "#juries" is a real
  // deep link and the back button steps through the control plane.
  useEffect(() => {
    const read = () => hashView(window.location.hash);
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

  // Local-first: nothing leaves this device, so "export" is the honest verb.
  // The control writes a JSON snapshot of the surface to this machine's
  // downloads. It never claims a server round-trip it cannot perform.
  const exportView = useCallback(() => {
    const at = new Date();
    const name = exportName(view, at);
    const payload = {
      surface: "APT-LABS protocol node",
      state: "PROTOTYPE",
      view: VIEW_TITLES[view],
      exportedAt: at.toISOString(),
      loop: LOOP,
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
        {/* ── Sidebar ── */}
        <aside className="pn-side" aria-label="Protocol node">
          <Link className="pn-brand" href={PROTOCOL_HOME}>
            <span className="pn-mark" aria-hidden="true">A</span>
            <span>APT-LABS</span>
          </Link>

          <div className="pn-node">
            <small>Protocol node</small>
            <strong>Kirinyaga / 01</strong>
            <div className="pn-live">Local node interface</div>
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
                <span className="pn-nav-glyph" aria-hidden="true">{n.glyph}</span>
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
                <span className="pn-nav-glyph" aria-hidden="true">{n.glyph}</span>
                {n.label}
              </a>
            ))}
          </nav>

          <div className="pn-navlabel" id="pn-grp-routes">Support routes</div>
          <nav className="pn-navgroup pn-navgroup--routes" aria-labelledby="pn-grp-routes">
            {SUPPORT.map((s) => (
              <Link key={s.href} href={s.href} className="pn-route">
                <span className="pn-route-label">{s.label}</span>
                <span className="pn-route-path" aria-hidden="true">{s.href}</span>
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

        {/* ── Main ── */}
        <main className="pn-main">
          <div className="pn-top">
            <div className="pn-crumb">
              APT-LABS / <b>{VIEW_TITLES[view]}</b>
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
/* View shell: one active view at a time.                          */
/* ---------------------------------------------------------------- */

const VIEW_COMPONENTS: Record<PnView, React.ComponentType> = {
  overview: OverviewView,
  identity: IdentityView,
  contributions: ContributionsView,
  proposals: ProposalsView,
  juries: JuriesView,
  pools: PoolsView,
  assets: AssetsView,
  roll: RollView,
  audit: AuditView,
};

// The view list is derived from the router table, so the two cannot drift:
// adding a view to PnView forces an entry above, and the hash reader sees it.
const VIEWS = Object.keys(VIEW_COMPONENTS) as PnView[];

/** The hash is the router: #juries is deep-linkable and back/forward works. */
function hashView(hash: string): PnView {
  const key = hash.replace(/^#\/?/, "");
  return (VIEWS as string[]).includes(key) ? (key as PnView) : "overview";
}

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
/* 01 — OVERVIEW                                                    */
/* ---------------------------------------------------------------- */

function OverviewView() {
  return (
    <>
      <Command
        eyebrow="APT-LABS / Protocol Node"
        title={(
          <>
            The civic infrastructure
            <br />
            behind the build.
          </>
        )}
        copy="A local control plane connecting contribution, collective decisions, allocation, physical execution and verifiable evidence. Governance mechanisms are explicit protocol objects — not invisible authority."
        specs={[
          ["Node", "Kirinyaga / local"],
          ["Mode", "Opt-in / prototype"],
          ["Ledger", "People + assets"],
          ["Evidence", "Signed / traceable"],
        ]}
      />

      <div className="pn-pulse" role="group" aria-label="Protocol state">
        <div className="pn-pulse-main">
          <div className="eyebrow">Protocol loop</div>
          <strong>{LOOP}</strong>
        </div>
        <div className="pn-pulse-cell"><small>Mode</small><b>Prototype</b></div>
        <div className="pn-pulse-cell"><small>Records</small><b>Illustrative</b></div>
        <div className="pn-pulse-cell"><small>Storage</small><b>This browser</b></div>
        <div className="pn-pulse-cell"><small>Export</small><b>Local JSON</b></div>
      </div>

      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Node overview</h2>
          <span>No hidden state / no automatic trust elevation</span>
        </div>
        <div className="pn-grid2">
          <div className="pn-panel">
            <div className="pn-panelhead">
              <span>Topology</span>
              <strong>Local execution surface</strong>
            </div>
            <div className="pn-map" role="img" aria-label="Protocol node topology: four local registers around a single execution core">
              <div className="pn-mnode pn-mnode--live pn-mnode--1"><small>01</small><b>People</b></div>
              <div className="pn-mnode pn-mnode--review pn-mnode--2"><small>02</small><b>Proposals</b></div>
              <div className="pn-mnode pn-mnode--live pn-mnode--3"><small>03</small><b>Assets</b></div>
              <div className="pn-mnode pn-mnode--live pn-mnode--4"><small>04</small><b>Evidence</b></div>
              <div className="pn-core" aria-hidden="true" />
              <div className="pn-core-label">protocol<br />node</div>
            </div>
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
                  <span className="pn-surface-path">{s.path}</span>
                  <span className="pn-surface-state">{s.state}</span>
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
/* 02 — IDENTITY                                                    */
/* ---------------------------------------------------------------- */

function IdentityView() {
  const rows = NODE.identity;
  return (
    <>
      <Command
        eyebrow="01 / Identity"
        title={(
          <>
            Prove what matters.
            <br />
            Reveal less.
          </>
        )}
        copy="Identity is a credential layer, not a power meter. Eligibility can be proven without exposing unnecessary personal information to every verifier."
        specs={[
          ["Credential", "Verifiable claim"],
          ["Proof", "Selective disclosure"],
          ["Recovery", "Human + local path"],
          ["Appeal", "Independent review"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Credential objects</h2>
          <span>Prototype policy</span>
        </div>
        <Registry
          rows={rows}
          evidence="Issuer or witness record for the claimed attribute, plus the disclosure scope."
        />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 03 — CONTRIBUTIONS                                               */
/* ---------------------------------------------------------------- */

function ContributionsView() {
  const rows = NODE.contributions;
  return (
    <>
      <Command
        eyebrow="02 / Contributions"
        title={(
          <>
            Contribution becomes
            <br />
            inspectable history.
          </>
        )}
        copy="Useful work becomes an evidence-backed event. Contribution may later inform eligibility or reputation, but that mapping remains an explicit protocol rule."
        specs={[
          ["Submit", "Event + evidence"],
          ["Verify", "Issuer / witness"],
          ["Attribute", "Person + asset"],
          ["Record", "The Roll"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Contribution events</h2>
          <span>Illustrative records</span>
        </div>
        <Registry
          rows={rows}
          tinted
          evidence="Issuer or witness signature, the contributing person, the linked asset and the event timestamp."
        />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 04 — PROPOSALS                                                   */
/* ---------------------------------------------------------------- */

function ProposalsView() {
  return (
    <>
      <Command
        eyebrow="03 / Proposals"
        title={(
          <>
            Public choices.
            <br />
            Explicit rules.
          </>
        )}
        copy="Every proposal declares the question, budget, eligibility, decision method, execution condition and appeal path before a decision is made."
        specs={[
          ["Question", "Publicly stated"],
          ["Budget", "Bounded"],
          ["Rule", "Versioned"],
          ["Appeal", "Defined before execution"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Open proposals</h2>
          <span>No outcome implied</span>
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
/* 05 — JURIES                                                      */
/* ---------------------------------------------------------------- */

function JuriesView() {
  const rows = NODE.juries;
  return (
    <>
      <Command
        eyebrow="04 / Juries"
        title={(
          <>
            Sortition, with
            <br />
            receipts.
          </>
        )}
        copy="Temporary panels are protocol objects: eligibility, randomness source, selection proof, conflicts, duration, decision and appeal are recorded."
        specs={[
          ["Selection", "Randomized / scoped"],
          ["Privacy", "Selective reveal"],
          ["Conflict", "Declared"],
          ["Decision", "Signed"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Temporary panels</h2>
          <span>Illustrative protocol objects</span>
        </div>
        <div className="pn-jury" role="group" aria-label="Temporary sortition panels">
          {rows.map((r) => (
            <div className="pn-juryrow" key={r.id}>
              <div className="pn-jid">{r.id}</div>
              <div>
                <div className="pn-jsub">{r.sub}</div>
                <div className="pn-jmeta">{r.meta}</div>
              </div>
              <div className={`pn-jstate${r.tint === "live" ? " pn-jstate--live" : r.tint === "gold" ? " pn-jstate--gold" : ""}`}>
                {r.state}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 06 — ALLOCATION POOLS                                            */
/* ---------------------------------------------------------------- */

function PoolsView() {
  return (
    <>
      <Command
        eyebrow="05 / Allocation pools"
        title={(
          <>
            Capital follows
            <br />
            declared rules.
          </>
        )}
        copy="Funding pools stay separate from the identity ledger. Contributions, matching logic, thresholds, release conditions and post-build evidence are explicit."
        specs={[
          ["Funding", "Community pool"],
          ["Rule", "Versioned matching"],
          ["Release", "Milestone bound"],
          ["Reconcile", "The Roll"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Allocation pools</h2>
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
/* 07 — ASSETS                                                      */
/* ---------------------------------------------------------------- */

function AssetsView() {
  const rows = NODE.assets;
  return (
    <>
      <Command
        eyebrow="06 / Assets"
        title={(
          <>
            From decision
            <br />
            to physical reality.
          </>
        )}
        copy="Allocation is not completion. Assets move through explicit lifecycle states, each requiring the evidence appropriate to that state."
        specs={[
          ["Planned", "Specification"],
          ["Fabricated", "Build evidence"],
          ["Installed", "Handover evidence"],
          ["Verified", "Claim-specific proof"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Asset register</h2>
          <span>The Roll / asset side</span>
        </div>
        <Registry
          rows={rows}
          evidence="BOM or build record, source note, installer or handover record and the acceptance checklist."
        />
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 08 — THE ROLL                                                    */
/* ---------------------------------------------------------------- */

function RollView() {
  const rows = NODE.transitions;
  return (
    <>
      <Command
        eyebrow="07 / The Roll"
        title={(
          <>
            One ledger.
            <br />
            Two registers.
          </>
        )}
        copy="The Roll links people, contributions, assets, costs and evidence. Governance mechanisms can read the ledger, but the ledger itself does not decide who has power."
        specs={[
          ["People", "Contribution record"],
          ["Assets", "Lifecycle record"],
          ["Evidence", "Cryptographic integrity"],
          ["Governance", "Explicit policy layer"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Audit trail</h2>
          <span>Illustrative records</span>
        </div>
        <div className="pn-auditlist">
          {rows.map((r) => (
            <div className="pn-auditrow" key={r.key}>
              <span>{r.key}</span>
              <p>{r.msg}</p>
              <span className={`pn-auditstate pn-auditstate--${r.tint}`}>{r.state}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* 09 — AUDIT                                                       */
/* ---------------------------------------------------------------- */

function AuditView() {
  const rows = NODE.audit;
  const principles = [
    ["01 / Identity separation", "Identity assurance does not automatically determine governance weight."],
    ["02 / Privacy", "Reveal only the attributes required for the claim being verified."],
    ["03 / No unilateral mutation", "High-impact transitions require explicit authorization paths."],
    ["04 / Appeals", "Disputed records have a visible path to review and correction."],
    ["05 / External audit", "Exports permit independent reconstruction of protocol decisions."],
  ];
  return (
    <>
      <Command
        eyebrow="08 / Audit"
        title={(
          <>
            Trust is a trail,
            <br />
            not a badge.
          </>
        )}
        copy="High-impact transitions should be reconstructable: rule version, actors, evidence, timing, authorization, outcome and appeal state."
        specs={[
          ["Integrity", "Hashes / signatures"],
          ["Rules", "Versioned"],
          ["Appeals", "Recorded"],
          ["Exports", "Machine-readable"],
        ]}
      />
      <div className="pn-section">
        <div className="pn-sectionhead">
          <h2>Capture controls</h2>
          <span>Trace + principles</span>
        </div>
        <div className="pn-audit">
          <div className="pn-auditlist">
            <div className="pn-panelhead">
              <span>Recent transitions</span>
              <strong>Trace</strong>
            </div>
            {rows.map((r) => (
              <div className="pn-auditrow" key={r.key}>
                <span>{r.key}</span>
                <p>{r.msg}</p>
                <span className={`pn-auditstate pn-auditstate--${r.tint}`}>{r.state}</span>
              </div>
            ))}
          </div>
          <aside className="pn-principles">
            <h3>Capture controls.</h3>
            {principles.map(([label, body]) => (
              <div className="pn-principle" key={label}>
                <b>{label}</b>
                {body}
              </div>
            ))}
          </aside>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Reusable pieces                                                 */
/* ---------------------------------------------------------------- */

function Command({
  eyebrow,
  title,
  copy,
  specs,
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  specs: [string, string][];
}) {
  return (
    <div className="pn-command">
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
