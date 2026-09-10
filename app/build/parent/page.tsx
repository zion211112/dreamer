"use client";

import { useState } from "react";
import GeoArt from "../../../components/GeoArt";
import { SUBSCRIBED_SCHOOLS } from "../../../lib/ledger";

// Parent door: free. Kid age + school. Scores show iff the school is subscribed.
export default function Parent() {
  const [age, setAge] = useState("");
  const [school, setSchool] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!age.trim() || !school.trim()) return;
    const hit = SUBSCRIBED_SCHOOLS.some((s) => s.toLowerCase() === school.trim().toLowerCase());
    setChecked(hit);
  }

  const field = "rounded-2xl border border-white/15 bg-obsidian px-4 py-3 text-sm text-ivory outline-none focus:border-river";

  return (
    <main className="bg-obsidian text-ivory">
      <div className="relative overflow-hidden">
        <GeoArt variant="ring" className="pointer-events-none absolute -left-24 top-10 h-[300px] w-[300px] text-ivory opacity-[0.06]" />
        <div className="relative mx-auto max-w-3xl px-6 py-14">
          <p className="text-xs font-bold tracking-widest text-river">PARENT DOOR · FREE</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">How is my kid doing?</h1>
          <p className="mt-4 text-muted leading-relaxed">Age and school. If the school is on the list, the scores show. If not, you get the note that fixes that.</p>

          <form onSubmit={check} className="mt-8 rounded-3xl border border-white/10 bg-panel p-7">
            <div className="grid sm:grid-cols-2 gap-2">
              <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Kid age (e.g. 12)" inputMode="numeric" maxLength={3} className={field} />
              <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School name" maxLength={60} className={field} />
            </div>
            <button className="mt-3 w-full rounded-full bg-ivory py-3.5 text-sm font-semibold text-black hover:bg-river hover:text-white transition">Check scores →</button>
          </form>

          {checked === true && (
            <div className="mt-6 rounded-3xl bg-river/15 border border-river/30 p-7">
              <div className="font-bold text-emerald-300">{school.trim()} is subscribed. ✓</div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[["Maths", "78%"], ["Reading", "84%"], ["Tasks", "12 done"]].map(([s, v]) => (
                  <div key={s} className="rounded-2xl bg-obsidian border border-white/10 py-4">
                    <div className="font-extrabold text-lg">{v}</div>
                    <div className="text-xs text-muted">{s}</div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Demo scores. Live figures flow once the school&apos;s term data lands.</p>
            </div>
          )}
          {checked === false && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-panel p-7">
              <div className="font-bold">{school.trim()} isn&apos;t on the list yet.</div>
              <p className="mt-2 text-sm text-muted">Hand this to your headteacher:</p>
              <blockquote className="mt-3 rounded-2xl bg-obsidian border border-white/10 p-5 text-sm leading-relaxed text-ivory/85">
                &ldquo;Dear Headteacher, parents at {school.trim()} want score reports from the APT-LABS ledger.
                Subscription is from KES 3,000/month, youth are paid per task, receipts included.
                Start at apt-labs: BUILD CAPACITY → School.&rdquo;
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
