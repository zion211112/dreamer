"use client";

import { useEffect, useState } from "react";
import "./benben.css";

type Comment = {
  handle: string;
  time: string;
  text: string;
};

type Build = {
  id: string;
  idx: string;
  slot: number;
  domain: string;
  state: "open" | "sealed" | "empty" | "claimed" | "expired";
  title: string;
  body: string;
  author: string;
  location: string;
  postedAt: number;
  expiresAt: number;
  votes: number;
  threshold: number;
  needs: string;
  done: string;
  comments: Comment[];
};

const HOUR = 3600000;
const NOW = Date.now();

const initialBuilds: Build[] = [
  { id: "power", idx: "01", slot: 0, domain: "Power", state: "open", title: "Bike-powered phone charger for 1,800 KES — parts list and wiring", body: "Dynamo 800, rectifier 350, regulator 250, casing and wire 400. Mount on the rear fork, output 5V 1A at walking pace. Full wiring order on request.", author: "@Fundi_0002", location: "Mwea", postedAt: NOW - 2 * HOUR, expiresAt: NOW + 50 * HOUR, votes: 1, threshold: 2, needs: "nothing — already built", done: "Anyone can build this with local parts", comments: [
    { handle: "@Mwalimu_0005", time: "1h", text: "Used this on my brother's boda last month. Works. The regulator runs warm but holds." },
    { handle: "@KeeperOfRostau", time: "42m", text: "Post the exact wiring order when you can. I want to build three for the Sagana survey team." }
  ] },
  { id: "edu", idx: "02", slot: 1, domain: "Education", state: "open", title: "I can animate 3-minute KCSE explainers — free in exchange for skill work", body: "Ten explainers queued: matrices, photosynthesis, Sarufi. I want them listed on the ledger instead of cash. Reviewers welcome.", author: "@Mwalimu_0005", location: "Mwea", postedAt: NOW - 2 * HOUR, expiresAt: NOW + 22 * HOUR, votes: 1, threshold: 3, needs: "intellect — reviewers for the ten explainers", done: "10 explainers published on APT-LABS, my name on the ledger", comments: [] },
  { id: "housing", idx: "03", slot: 2, domain: "Housing", state: "open", title: "Stabilized soil block recipe after 6 months of tests — 7% cement, 2% lime", body: "Tested across two rainy seasons. Passes county building standards, costs 40% less than fired brick. Full ratios and curing schedule in thread.", author: "@Seremala_0006", location: "Embu", postedAt: NOW - 3 * HOUR, expiresAt: NOW + 4 * HOUR, votes: 2, threshold: 2, needs: "nothing — already built", done: "Blocks that pass county standards, 40% cheaper than brick", comments: [
    { handle: "@VrilToSekhem", time: "2h", text: "I want to rework this with 5% cement and see if it holds through March. Same ratios otherwise." }
  ] },
  { id: "bridge", idx: "04", slot: 3, domain: "Mobility", state: "open", title: "Rebuild the Witeithie Kibute footbridge over reeds and stone", body: "The crossing is failed timber. Lashed reeds on two cinder piers, timber decking, load survey first. Fourteen pairs of hands. The KES ledger stays on the floor, line by line.", author: "@AptLabs", location: "Kagio", postedAt: NOW - 6 * HOUR, expiresAt: NOW + 66 * HOUR, votes: 2, threshold: 5, needs: "hands (14) · KES 180,000 · truss ratios", done: "A 500 kg truck crosses; two photos from either bank", comments: [
    { handle: "@Fundi_0002", time: "4h", text: "I can bring two welders and a grinder. Say when." },
    { handle: "@Seremala_0006", time: "3h", text: "Can supply 240 cinder blocks from Embu at cost. Logistics still open." }
  ] },
  { id: "legal", idx: "05", slot: 4, domain: "Legal", state: "sealed", title: "Swahili-first legal document Q&A agent for Kenyan SMEs", body: "Contracts, tenancy, and business registration — the documents a small firm actually signs. Swahili is the working language, English is the export.", author: "@AptLabs", location: "Mwea", postedAt: NOW - 22 * HOUR, expiresAt: NOW + 50 * HOUR, votes: 3, threshold: 3, needs: "hands (3) · KES 45,000 · Swahili legal corpus", done: "Fifty filed test questions answered with sources; one advocate's review on the floor", comments: [
    { handle: "@Shemsu_Node", time: "18h", text: "Ran the first twenty questions through it. Citations held. One error on a tenancy term." }
  ] },
  { id: "audit", idx: "06", slot: 5, domain: "Audit", state: "open", title: "Purple-team audit kit for Kenyan SMEs", body: "Ten probes a small business can run on itself: phishing drills, credential checks, a day of open shares. Written in plain language; the fixes as cards, in English and Swahili.", author: "@AptLabs", location: "Kagio", postedAt: NOW - 1 * HOUR, expiresAt: NOW + 71 * HOUR, votes: 0, threshold: 3, needs: "hands (2) · KES 12,000 · phishing templates", done: "Ten probes run on a consenting SME box; fix cards in English and Swahili", comments: [] },
  { id: "empty-07", idx: "07", slot: 6, domain: "Open", state: "empty", title: "an unclaimed slot", body: "", author: "", location: "", postedAt: NOW, expiresAt: NOW, votes: 0, threshold: 1, needs: "", done: "", comments: [] },
  { id: "empty-08", idx: "08", slot: 7, domain: "Open", state: "empty", title: "an unclaimed slot", body: "", author: "", location: "", postedAt: NOW, expiresAt: NOW, votes: 0, threshold: 1, needs: "", done: "", comments: [] }
];

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char as keyof Record<string, string>] ?? char));

const phase = (build: Build) => {
  if (build.state === "empty") return "empty";
  if (build.state === "sealed") return "sealed";
  const left = build.expiresAt - Date.now();
  if (left <= 0) return "expired";
  if (left < 6 * HOUR) return "final";
  return "open";
};

const clockText = (build: Build) => {
  if (build.state === "empty") return "awaiting";
  if (build.state === "sealed") return "sealed";
  const left = build.expiresAt - Date.now();
  if (left <= 0) return "expired";
  const hours = Math.max(0, Math.floor(left / HOUR));
  return left < 6 * HOUR ? `final ${hours}h` : `${hours}h left`;
};

const stripPct = (build: Build) => {
  if (build.state === "empty") return 0;
  if (build.state === "sealed") return 100;
  const total = build.expiresAt - build.postedAt;
  const left = Math.max(0, build.expiresAt - Date.now());
  return (left / total) * 100;
};

export default function BenBenPage() {
  const [builds, setBuilds] = useState<Build[]>(initialBuilds);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && focusedId) {
        setFocusedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedId]);

  const updateBuild = (id: string, fn: (build: Build) => Build) => {
    setBuilds((current) => current.map((build) => (build.id === id ? fn(build) : build)));
  };

  const toggleFocused = (id: string) => {
    setFocusedId((current) => (current === id ? null : id));
  };

  const voteFor = (id: string) => {
    updateBuild(id, (build) => {
      if (build.state === "empty" || build.state === "sealed") return build;
      return { ...build, votes: Math.min(build.votes + 1, build.threshold) };
    });
  };

  const signBuild = (id: string) => {
    updateBuild(id, (build) => {
      if (build.state !== "open") return build;
      return { ...build, state: "claimed", author: build.author || "@you", location: build.location || "Kirinyaga" };
    });
  };

  const proveBuild = (id: string) => {
    updateBuild(id, (build) => ({ ...build, state: "sealed" }));
  };

  const reworkBuild = (id: string) => {
    const source = builds.find((build) => build.id === id);
    const emptySlot = builds.find((build) => build.state === "empty");
    if (!source || !emptySlot) return;

    const nextEntry: Build = {
      ...emptySlot,
      id: `rework-${Date.now()}`,
      domain: source.domain,
      state: "open",
      title: `Rework: ${source.title.replace(/^Rework:\s*/, "")}`,
      body: `A rework of entry ${source.idx}. ${source.body}`,
      author: "@you",
      location: "Kirinyaga",
      postedAt: Date.now(),
      expiresAt: Date.now() + 72 * HOUR,
      votes: 0,
      threshold: source.threshold,
      needs: source.needs,
      done: source.done,
      comments: [{ handle: "@you", time: "now", text: `Reworked from entry ${source.idx}. Reason: —` }]
    };

    setBuilds((current) => current.map((build) => (build.id === emptySlot.id ? nextEntry : build)));
    setFocusedId(nextEntry.id);
  };

  const postSlot = (id: string) => {
    updateBuild(id, (build) => ({
      ...build,
      id: `post-${Date.now()}`,
      domain: "Open",
      state: "open",
      title: "Untitled build — awaiting proposal",
      body: "Sign this slot to publish a build.",
      author: "@you",
      location: "Kirinyaga",
      postedAt: Date.now(),
      expiresAt: Date.now() + 72 * HOUR,
      votes: 0,
      threshold: 3,
      needs: "to be specified",
      done: "to be specified",
      comments: []
    }));
    setFocusedId(`post-${Date.now()}`);
  };

  const addComment = (formId: string, text: string) => {
    if (!text.trim()) return;
    setBuilds((current) => current.map((build) =>
      build.id === formId
        ? { ...build, comments: [...build.comments, { handle: "@you", time: "now", text: text.trim() }] }
        : build
    ));
  };

  const proveable = (build: Build) =>
    build.state === "claimed" || (build.state === "open" && build.votes >= build.threshold);

  return (
    <main className="benben-legacy-page">
      <div className="page">
        <header className="head">
          <span className="kicker">
            BenBen <span className="sep">·</span> Block <span className="gold">0008</span> <span className="sep">·</span> Kirinyaga
          </span>
          <h1>The Floor</h1>
          <p className="sub">Post. Vote. Sign. Prove.</p>
        </header>

        <div className="spine" aria-hidden="true" />

        <main className="ledger" id="ledger" role="list">
          {builds.map((build, index) => {
            const side = index % 2 === 0 ? "left" : "right";
            const ph = phase(build);
            const over = build.votes >= build.threshold && build.state !== "empty" && build.state !== "sealed";
            const dots = Array.from({ length: build.threshold }, (_, dotIndex) => (
              <span key={`${build.id}-dot-${dotIndex}`} className={`dot${dotIndex < build.votes ? " filled" : ""}`} />
            ));
            const dimmed = !!focusedId && focusedId !== build.id;
            const open = focusedId === build.id;
            const commentsHtml = build.comments.length
              ? build.comments.map((comment, commentIndex) => (
                  <div className="comment" key={`${build.id}-comment-${commentIndex}`}>
                    <span className="c-num">{String(commentIndex + 1).padStart(2, "0")}</span>
                    <div className="c-body">
                      <div className="c-meta">
                        <span className="c-handle">{comment.handle}</span>
                        <span className="c-sep">·</span>
                        <span className="c-time">{comment.time}</span>
                      </div>
                      <div className="c-text">{comment.text}</div>
                    </div>
                  </div>
                ))
              : <p className="comments-empty">No one has spoken on this yet.</p>;

            if (build.state === "empty") {
              return (
                <article
                  key={build.id}
                  className={`entry ${side}`}
                  data-id={build.id}
                  data-state="empty"
                  data-phase="empty"
                  role="listitem"
                >
                  <div className="marker" aria-hidden="true">
                    <span className="num">{build.idx}</span>
                    <div className="state-dot" />
                    <div className="strip" />
                  </div>
                  <div className="content">
                    <div className="meta-line">
                      <span className="domain">Open</span>
                      <span className="meta-rule" />
                    </div>
                    <h2 className="title">an unclaimed slot</h2>
                    <div className="author">{build.idx === "07" ? "tomorrow" : "the day after"}</div>
                    <div className="clock"><span className="clock-dash" /><span>awaiting</span></div>
                    <div className="actions">
                      <button type="button" className="action primary" onClick={() => postSlot(build.id)}>sign this slot</button>
                    </div>
                  </div>
                </article>
              );
            }

            return (
              <article
                key={build.id}
                className={`entry ${side}${open ? " open" : ""}${dimmed ? " dimmed" : ""}`}
                data-id={build.id}
                data-state={build.state}
                data-phase={ph}
                data-over={over}
                role="listitem"
              >
                <div className="marker" aria-hidden="true">
                  <span className="num">{build.idx}</span>
                  <div className="state-dot" />
                  <div className="strip">
                    <div className="strip-fill" style={{ height: `${stripPct(build)}%` }} />
                  </div>
                </div>
                <div className="content" onClick={() => toggleFocused(build.id)}>
                  <div className="meta-line">
                    <span className="domain">{build.domain}</span>
                    <span className="meta-rule" />
                    <span className="votes" aria-hidden="true">{dots}</span>
                    <span className="vote-num">{build.votes}/{build.threshold}</span>
                  </div>
                  <h2 className="title">{build.title}</h2>
                  <div className="author">{build.author}<span className="sep">·</span>{build.location}</div>
                  <div className="clock"><span className="clock-dash" /><span>{clockText(build)}</span></div>

                  <div className="expand">
                    <div className="body">{build.body}</div>
                    <dl className="facts">
                      <div className="fact"><dt>Needs</dt><dd>{build.needs}</dd></div>
                      <div className="fact"><dt>Done</dt><dd className="done">{build.done}</dd></div>
                    </dl>
                    <div className="actions">
                      <button type="button" className="action primary" onClick={(event) => { event.stopPropagation(); voteFor(build.id); }}>vote</button>
                      {build.state === "open" && build.votes < build.threshold && (
                        <button type="button" className="action" onClick={(event) => { event.stopPropagation(); signBuild(build.id); }}>sign</button>
                      )}
                      {build.state !== "sealed" && proveable(build) && (
                        <button type="button" className="action" onClick={(event) => { event.stopPropagation(); proveBuild(build.id); }}>prove</button>
                      )}
                      {build.state !== "sealed" && (
                        <button type="button" className="action" onClick={(event) => { event.stopPropagation(); reworkBuild(build.id); }}>rework →</button>
                      )}
                    </div>

                    <div className="comments">
                      <div className="comments-head">
                        <span>The floor speaks <span className="gold">·</span> {build.comments.length}</span>
                        <span>{build.comments.length ? `${build.comments.length} annotation${build.comments.length === 1 ? "" : "s"}` : "silent"}</span>
                      </div>
                      <div className="comment-list">{commentsHtml}</div>
                      <form
                        className="comment-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const form = event.currentTarget as HTMLFormElement;
                          const textarea = form.querySelector("textarea") as HTMLTextAreaElement | null;
                          if (!textarea) return;
                          addComment(build.id, textarea.value);
                          textarea.value = "";
                        }}
                      >
                        <textarea className="comment-input" rows={2} placeholder="Add an annotation…" />
                        <button type="submit" className="comment-submit">add annotation</button>
                      </form>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </main>

        <div className="root" aria-hidden="true">
          <div className="mark" />
        </div>

        <footer className="foot">
          Eight slots · <span className="gold">sealed by proof</span>
        </footer>
      </div>
    </main>
  );
}

