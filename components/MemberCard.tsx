import { Member, shortHash } from "../lib/ledger";

// A face on the roll. Shown only behind the paid vault — never in public.
export default function MemberCard({ m }: { m: Member }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-panel p-6">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-ivory">{m.id}</span>
        {m.verified ? (
          <span className="rounded-full bg-river/15 px-3 py-1 font-semibold text-emerald-300">● SEALED{m.tier ? ` · ${m.tier.toUpperCase()}` : ""}</span>
        ) : m.paid ? (
          <span className="rounded-full bg-gold/15 px-3 py-1 font-semibold text-gold">● PAID · UNSEALED</span>
        ) : (
          <span className="rounded-full bg-white/5 px-3 py-1 font-semibold text-muted">○ PLAYGROUND</span>
        )}
      </div>
      <div className="mt-3 text-xl font-bold text-ivory">{m.name}</div>
      <div className="mt-1 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-full bg-obsidian border border-white/10 px-3 py-1 font-semibold text-ivory">{m.occupation}</span>
        <span className="rounded-full bg-obsidian border border-white/10 px-3 py-1 text-muted">{m.location}</span>
      </div>
      <div className="mt-3 text-[13px] text-muted">{m.skills.join(" · ")}</div>
      <div className="mt-3 font-mono text-xs text-muted">hash {shortHash(m.hash)}</div>
    </div>
  );
}
