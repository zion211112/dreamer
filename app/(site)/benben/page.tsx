"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  state: "open" | "sealed" | "empty" | "claimed";
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
  return Array.from({ length: 4 }, (_, index) => ({
    id: `empty-${index + 1}`,
    idx: String(index + 1).padStart(2, "0"),
    slot: index,
    domain: "Open",
    state: "empty" as const,
    title: "an unclaimed slot",
    body: "",
    author: "",
    location: "",
    postedAt: NOW,
    expiresAt: NOW,
    votes: 0,
    threshold: 3,
    needs: "",
    done: "",
    comments: [],
  }));
}

const clockText = (build: Build) => {
  if (build.state === "empty") return "awaiting";
  if (build.state === "sealed") return "sealed";
  const left = build.expiresAt - Date.now();
  if (left <= 0) return "expired";
  const hours = Math.max(0, Math.floor(left / HOUR));
  return left < 6 * HOUR ? `final ${hours}h` : `${hours}h left`;
};

export default function BenBenPage() {
  const [builds, setBuilds] = useState<Build[]>(initialBuilds);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && focusedId) setFocusedId(null);
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
      return {
        ...build,
        state: "claimed",
        author: build.author || "@you",
        location: build.location || "Kirinyaga",
      };
    });
  };

  const proveBuild = (id: string) => {
    updateBuild(id, (build) => ({ ...build, state: "sealed" }));
  };

  const postSlot = (id: string) => {
    const stamp = Date.now();
    updateBuild(id, (build) => ({
      ...build,
      id: `post-${stamp}`,
      domain: "Open",
      state: "open",
      title: "Untitled build — awaiting proposal",
      body: "Sign this slot to publish a build. Describe the work, what is needed, and what done looks like.",
      author: "@you",
      location: "Kirinyaga",
      postedAt: stamp,
      expiresAt: stamp + 72 * HOUR,
      votes: 0,
      threshold: 3,
      needs: "to be specified",
      done: "to be specified",
      comments: [],
    }));
    setFocusedId(`post-${stamp}`);
  };

  const addComment = (formId: string, text: string) => {
    if (!text.trim()) return;
    setBuilds((current) =>
      current.map((build) =>
        build.id === formId
          ? {
              ...build,
              comments: [...build.comments, { handle: "@you", time: "now", text: text.trim() }],
            }
          : build
      )
    );
  };

  const proveable = (build: Build) =>
    build.state === "claimed" || (build.state === "open" && build.votes >= build.threshold);

  return (
    <main className="sublime benben-sublime">
      <div className="sublime-glow" aria-hidden="true" />

      {/* Hero — distilled from reference images: eyebrow + short H1 + one sub + dual CTA */}
      <section className="sublime-hero benben-hero">
        <div className="site-frame benben-hero-grid">
          <div>
            <p className="sublime-eyebrow">
              <span className="sublime-eyebrow-dot" aria-hidden="true" />
              BenBen · The Floor · Intake layer
            </p>
            <h1 className="page-title sublime-title">Capability enters here.</h1>
            <p className="sublime-lede">
              Local capability, work, makers and ideas enter here, are reviewed on this
              device, then can move into Fab or Studio before evidence is recorded in
              The Roll. Most of it is still being built.
            </p>
            <div className="sublime-actions">
              <a href="#floor" className="site-action">
                Sign a slot <span aria-hidden="true">→</span>
              </a>
              <Link href="/evidence" className="site-action-secondary">
                How proof works
              </Link>
            </div>
          </div>

          {/* Product visual slot — honest system diagram, not photography.
              Reference images use chair / phone / calendar; evidence pack §16
              forbids field photography, so the motif + state rail stands in. */}
          <aside className="benben-visual" aria-label="Intake state">
            <div className="benben-visual-head">
              <span>Floor state</span>
              <span>Prototype</span>
            </div>
            <div className="benben-visual-grid">
              <div>
                <span>Slots</span>
                <strong>04 · empty</strong>
              </div>
              <div>
                <span>Storage</span>
                <strong>this browser</strong>
              </div>
              <div>
                <span>Seal</span>
                <strong>SHA-256</strong>
              </div>
              <div>
                <span>Shared DB</span>
                <strong>none</strong>
              </div>
            </div>
            <p className="benben-visual-note">
              No deployment, beneficiary, procurement or impact record is implied.
            </p>
          </aside>
        </div>
      </section>

      {/* State strip — honest replacement for the reference logo bars.
          Their “Trusted by” row becomes our evidence-state row. */}
      <section className="sublime-whisper benben-strip" aria-label="How the floor works">
        <div className="site-frame">
          <div className="sublime-whisper-row" role="list">
            <span role="listitem">Post</span>
            <span role="listitem">Vote</span>
            <span role="listitem">Sign</span>
            <span role="listitem">Prove</span>
          </div>
          <p className="sublime-whisper-note">
            NO SEEDED BUILDS — the Floor starts with empty slots. Anything entered here
            stays in this browser until exported.
          </p>
        </div>
      </section>

      {/* Floor — the restored empty-slot machine, restyled to sublime tokens */}
      <section id="floor" className="site-page benben-floor">
        <div className="site-frame">
          <div className="site-section-head">
            <span>The Floor / 04 slots</span>
            <span>local-first · Prototype</span>
          </div>

          <div className="benben-grid" role="list">
            {builds.map((build) => {
              const open = focusedId === build.id;
              const dimmed = !!focusedId && focusedId !== build.id;
              const dots = Array.from({ length: build.threshold }, (_, i) => (
                <span
                  key={`${build.id}-dot-${i}`}
                  className={`benben-dot${i < build.votes ? " filled" : ""}`}
                  aria-hidden="true"
                />
              ));

              if (build.state === "empty") {
                return (
                  <article
                    key={build.id}
                    className="benben-card benben-card--empty"
                    data-state="empty"
                    role="listitem"
                  >
                    <div className="benben-card-top">
                      <span className="benben-idx">{build.idx}</span>
                      <span className="benben-domain">Open</span>
                    </div>
                    <h2 className="benben-title">an unclaimed slot</h2>
                    <p className="benben-clock">awaiting</p>
                    <button
                      type="button"
                      className="site-action benben-btn"
                      onClick={() => postSlot(build.id)}
                    >
                      Sign this slot
                    </button>
                  </article>
                );
              }

              return (
                <article
                  key={build.id}
                  className={`benben-card${open ? " open" : ""}${dimmed ? " dimmed" : ""}`}
                  data-state={build.state}
                  role="listitem"
                >
                  <div
                    className="benben-card-top"
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
                    <span className="benben-idx">{build.idx}</span>
                    <span className="benben-domain">{build.domain}</span>
                    <span className="benben-votes" aria-label={`${build.votes} of ${build.threshold} votes`}>
                      {dots}
                      <span className="benben-vote-num">
                        {build.votes}/{build.threshold}
                      </span>
                    </span>
                  </div>
                  <h2 className="benben-title">{build.title}</h2>
                  <p className="benben-meta">
                    {build.author}
                    <span aria-hidden="true"> · </span>
                    {build.location}
                  </p>
                  <p className="benben-clock">{clockText(build)}</p>

                  {open && (
                    <div className="benben-expand">
                      <p className="benben-body">{build.body}</p>
                      <dl className="benben-facts">
                        <div>
                          <dt>Needs</dt>
                          <dd>{build.needs}</dd>
                        </div>
                        <div>
                          <dt>Done</dt>
                          <dd>{build.done}</dd>
                        </div>
                      </dl>
                      <div className="benben-actions">
                        <button
                          type="button"
                          className="site-action benben-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            voteFor(build.id);
                          }}
                        >
                          Vote
                        </button>
                        {build.state === "open" && build.votes < build.threshold && (
                          <button
                            type="button"
                            className="site-action-secondary benben-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              signBuild(build.id);
                            }}
                          >
                            Sign
                          </button>
                        )}
                        {build.state !== "sealed" && proveable(build) && (
                          <button
                            type="button"
                            className="site-action-secondary benben-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              proveBuild(build.id);
                            }}
                          >
                            Prove
                          </button>
                        )}
                      </div>

                      <div className="benben-comments">
                        <p className="benben-comments-head">
                          Annotations · {build.comments.length}
                        </p>
                        {build.comments.length ? (
                          build.comments.map((c, i) => (
                            <div className="benben-comment" key={`${build.id}-c-${i}`}>
                              <span className="benben-comment-handle">{c.handle}</span>
                              <span className="benben-comment-text">{c.text}</span>
                            </div>
                          ))
                        ) : (
                          <p className="benben-comments-empty">No one has spoken on this yet.</p>
                        )}
                        <form
                          className="benben-comment-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const form = event.currentTarget as HTMLFormElement;
                            const ta = form.querySelector("textarea");
                            if (!ta) return;
                            addComment(build.id, ta.value);
                            ta.value = "";
                          }}
                        >
                          <textarea
                            className="site-field benben-comment-input"
                            rows={2}
                            placeholder="Add an annotation…"
                            aria-label="Add an annotation"
                          />
                          <button type="submit" className="site-action-secondary benben-btn">
                            Annotate
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="identity-notice benben-boundary" role="note">
            Intake layer for the BenBen Builds track — not a company face. Local where practical. Import where
            necessary. Document the difference. Nothing here leaves this device until
            exported. See <Link href="/evidence">the evidence boundary</Link>.
          </div>
        </div>
      </section>
    </main>
  );
}
