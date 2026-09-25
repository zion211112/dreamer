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

function initialBuilds(): Build[] {
  const initialBuildCount = 4;
  return Array.from({ length: initialBuildCount }, (_, index) => ({
    id: `empty-${index + 1}`,
    idx: String(index + 1).padStart(2, "0"),
    slot: index,
    domain: "Open",
    state: "empty",
    title: "an unclaimed slot",
    body: "",
    author: "",
    location: "",
    postedAt: NOW,
    expiresAt: NOW,
    votes: 0,
    threshold: 1,
    needs: "",
    done: "",
    comments: [],
  } satisfies Build));
}

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
        <div className="benben-demo-notice" role="note">
          <strong>NO SEEDED BUILDS — THE FLOOR STARTS EMPTY.</strong>
          <span>The Floor starts with empty slots. Anything entered here stays in this browser until exported. No deployment, beneficiary, procurement or impact record is implied.</span>
        </div>

        <header className="head">
          <span className="kicker">
            BenBen <span className="sep">·</span> Block <span className="gold">0008</span> <span className="sep">·</span> Kirinyaga
          </span>
          <h1 className="page-title">The Floor</h1>
          <p className="sub">Post. Vote. Sign. Prove.</p>
        </header>

        <div className="spine" aria-hidden="true" />

        <div className="ledger" id="ledger" role="list">
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
             <div
               className="content"
               role="group"
               tabIndex={0}
               aria-label={`${open ? "Collapse" : "Expand"} ${build.title}`}
               onClick={(event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest("button, form, textarea, input, a")) return;
                  toggleFocused(build.id);
                }}
               onKeyDown={(event) => {
                 if (event.target !== event.currentTarget) return;
                 if (event.key === "Enter" || event.key === " ") {
                   event.preventDefault();
                   toggleFocused(build.id);
                 }
               }}
             >

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
        </div>

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

