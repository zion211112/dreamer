"use client";

import { useMemo, useState } from "react";

type Post = {
  id: string;
  title: string;
  tag: string;
  author: string;
  score: number;
  comments: number;
  reason: string;
  body: string;
};

const posts: Post[] = [
  {
    id: "bb-01",
    title: "Latest working setup: VS Code + Cline + AGENTS 3.0 Flash connected to Colab.",
    tag: "SETUP",
    author: "@njeri",
    score: 442,
    comments: 27,
    reason: "The fastest builders are not waiting for perfect tooling. They keep a working stack, ship the loop, and improve it in public.",
    body: "This is the setup people want: VS Code, Cline, a strong agent workflow, and Colab for experiments that need quick compute. It is not about hype; it is about making the real work faster. A Kenyan or Nigerian builder can reuse this pattern, change the stack, and build something useful without waiting for permission."
  },
  {
    id: "bb-02",
    title: "A Nigerian dev posted a local idea that could become a real exportable product.",
    tag: "IDEA",
    author: "@tolu",
    score: 398,
    comments: 31,
    reason: "Good ideas travel farther when they are posted, debated, and forked by people with different context. The room should make them sharper, not kill them.",
    body: "This is the kind of contribution BenBen is for: not just status updates, but local product thinking. A dev can post a development suggestion, a market angle, or a small automation that helps others ship. Another builder can ask for feedback, add a fork, or turn it into a small internal project. That is how quiet capacity becomes public momentum."
  },
  {
    id: "bb-03",
    title: "No one here outsources jobs. People work only on internal voted projects.",
    tag: "LABOUR",
    author: "@muthoni",
    score: 417,
    comments: 24,
    reason: "The floor protects against brain drain, fake gig work, and people extracting value without building local capacity. We want useful work, not extraction.",
    body: "BenBen is not a job board for exporting labor. It is a labor commons for internal projects that the community has voted to support. If a project matters to the people here, it gets attention, skills, and coordination. If it is not useful to the local stack, it does not get traction. The point is to keep work and value circulating inside the community."
  },
  {
    id: "bb-04",
    title: "Repair Witeithie Kibute Bridge: a public works project that deserves a real technical crew.",
    tag: "PROJECT",
    author: "@owino",
    score: 386,
    comments: 22,
    reason: "A real project is more than a pitch. It is a coordination problem, a skills problem, and a trust problem. When the community votes it in, the work becomes real.",
    body: "This is the sort of project the floor should help route: concrete, visible, valuable, and connected to the people who live with the problem every day. Builders can contribute design, planning, logistics, maintenance strategy, or field support. That is a better path than waiting for outsiders to solve everything."
  },
  {
    id: "bb-05",
    title: "Build Africa and yourself fast: share the setup, the hook, and the community you are forming.",
    tag: "COMMUNITY",
    author: "@kawe",
    score: 374,
    comments: 18,
    reason: "People do not need a perfect brand. They need a signal, a small group, and the right direction. A room with followers, forks, and votes can become the engine.",
    body: "Anyone can post, comment, and fork. Anyone can start a small sub-community around a problem they care about. A builder can get followers, organize a niche, and attract the people who can actually help. This is social media with will to power — not vanity, but momentum."
  }
];

export default function BenBenPage() {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [openForm, setOpenForm] = useState(false);

  const list = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      score: post.score + (votes[post.id] ?? 0)
    }));
  }, [votes]);

  const vote = (id: string, delta: 1 | -1) => {
    setVotes((current) => ({
      ...current,
      [id]: (current[id] ?? 0) + delta
    }));
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] text-[#1d1a17]" style={{ fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-[980px] px-5 pb-16 pt-12 sm:px-6 lg:px-8">
        <header className="pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <div className="text-[0.72rem] font-medium uppercase tracking-[0.26em] text-[#6b6252]">
              Ben-Ben · built by the floor
            </div>
            <button
              onClick={() => setOpenForm((v) => !v)}
              className="rounded-[999px] border border-[#1d1a17]/20 bg-transparent px-4 py-2 text-[0.8rem] font-medium text-[#1d1a17] transition hover:border-[#1d1a17]"
            >
              {openForm ? "Close fork" : "Fork the floor"}
            </button>
          </div>

          <div className="max-w-[760px]">
            <h1
              className="m-0 text-[clamp(3.1rem,7vw,6rem)] leading-[0.96] tracking-[-0.05em] text-[#1d1a17]"
              style={{ fontFamily: "'Fraunces', Georgia, serif" }}
            >
              Everyone can post, comment, and fork.
            </h1>
            <p className="mt-4 max-w-[58ch] text-[1.08rem] leading-7 text-[#5e5850]">
              BenBen is a builder commons for ideas, setups, local projects, skills, and trusted work. Share what helps people build faster. Vote on what matters. Keep the work local, useful, and public.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[16px] border border-[#d7d0c4] bg-white/40 p-4">
              <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6b6252]">Contribute</div>
              <div className="mt-2 text-2xl font-semibold text-[#1d1a17]">Any idea</div>
            </div>
            <div className="rounded-[16px] border border-[#d7d0c4] bg-white/40 p-4">
              <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6b6252]">Verified</div>
              <div className="mt-2 text-2xl font-semibold text-[#1d1a17]">Skill first</div>
            </div>
            <div className="rounded-[16px] border border-[#d7d0c4] bg-white/40 p-4">
              <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6b6252]">Signal</div>
              <div className="mt-2 text-2xl font-semibold text-[#204734]">Votes drive</div>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-[#d7d0c4] bg-[#f9f5ee] p-5">
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6b6252]">Builders</div>
            <p className="mt-3 text-[1rem] leading-7 text-[#2a2722]">
              Share working setups, useful scripts, tools, and practical product ideas that help builders move faster.
            </p>
          </div>
          <div className="rounded-[18px] border border-[#d7d0c4] bg-[#f9f5ee] p-5">
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6b6252]">Work</div>
            <p className="mt-3 text-[1rem] leading-7 text-[#2a2722]">
              Verified people can seek work or join internal projects. No outsourcing, no brain drain, no empty extraction.
            </p>
          </div>
          <div className="rounded-[18px] border border-[#d7d0c4] bg-[#f9f5ee] p-5">
            <div className="text-[0.68rem] uppercase tracking-[0.22em] text-[#6b6252]">Local power</div>
            <p className="mt-3 text-[1rem] leading-7 text-[#2a2722]">
              Communities form around local problems, infrastructure, and projects that deserve real technical energy.
            </p>
          </div>
        </section>

        {openForm && (
          <section className="mb-8 rounded-[20px] border border-[#d7d0c4] bg-[#f8f6f2] p-5 shadow-[0_8px_24px_rgba(29,26,23,0.04)]">
            <h2 className="text-[1.25rem] font-medium text-[#1d1a17]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Start a new contribution
            </h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-2 block text-[0.75rem] uppercase tracking-[0.18em] text-[#6b6252]">What are you proposing?</label>
                <textarea
                  rows={2}
                  className="w-full rounded-[10px] border border-[#d7d0c4] bg-transparent px-3 py-2.5 text-[0.95rem] text-[#1d1a17] outline-none focus:border-[#204734]"
                  placeholder="Share a setup, a project, or a local challenge."
                />
              </div>
              <div>
                <label className="mb-2 block text-[0.75rem] uppercase tracking-[0.18em] text-[#6b6252]">Why this matters</label>
                <textarea
                  rows={2}
                  className="w-full rounded-[10px] border border-[#d7d0c4] bg-transparent px-3 py-2.5 text-[0.95rem] text-[#1d1a17] outline-none focus:border-[#204734]"
                  placeholder="Explain the value, the people involved, and the reason it deserves votes."
                />
              </div>
              <button className="mt-1 inline-flex w-fit items-center rounded-[999px] bg-[#1d1a17] px-5 py-2.5 text-[0.82rem] font-medium text-[#f4f1ea] transition hover:bg-[#2b2824]">
                Submit contribution
              </button>
            </div>
          </section>
        )}

        <section className="space-y-5">
          {list.map((post) => (
            <article key={post.id} className="rounded-[18px] border border-[#d7d0c4] bg-[#faf7f2] p-5 shadow-[0_8px_28px_rgba(29,26,23,0.04)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3dccb] pb-3">
                <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em] text-[#6b6252]">
                  <span>{post.tag}</span>
                  <span className="text-[#a35d15]">{post.author}</span>
                </div>
                <div className="text-[0.7rem] uppercase tracking-[0.18em] text-[#6b6252]">Entry {post.id.replace("bb-", "").padStart(2, "0")}</div>
              </div>

              <h2 className="mt-4 text-[1.55rem] font-medium leading-snug text-[#1d1a17] sm:text-[1.9rem]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {post.title}
              </h2>

              <div className="mt-3 max-w-[62ch] rounded-[12px] border-l-[3px] border-[#ad7740] bg-[#f3ecdf] px-3 py-2 text-[0.92rem] leading-6 text-[#4e473d]">
                <span className="font-semibold text-[#1d1a17]">Reason:</span> {post.reason}
              </div>

              <p className="mt-4 max-w-[62ch] text-[1rem] leading-7 text-[#2a2722]">
                {post.body}
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#e3dccb] pt-4 text-[0.82rem] text-[#5e5850]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-[#d7d0c4] bg-white/60 px-2 py-1.5">
                    <button onClick={() => vote(post.id, 1)} className="px-1 text-sm text-[#1d1a17] hover:text-[#204734]" aria-label={`Upvote ${post.id}`}>
                      ▲
                    </button>
                    <span className="min-w-[2ch] text-center text-[0.92rem] font-semibold text-[#1d1a17]">{post.score}</span>
                    <button onClick={() => vote(post.id, -1)} className="px-1 text-sm text-[#1d1a17] hover:text-[#a35d15]" aria-label={`Downvote ${post.id}`}>
                      ▼
                    </button>
                  </div>
                  <button className="rounded-full border border-[#d7d0c4] bg-transparent px-3 py-1.5 text-[#1d1a17] transition hover:border-[#1d1a17]">
                    Fork
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span>{post.comments} comments</span>
                  <span>vote-driven, local, useful</span>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

