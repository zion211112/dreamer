'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ACTIVITY, type LedgerEntry, type OntoActivity } from '@/lib/ontology';

/* ══════════════════════════════════════════════════════════════
   SESSION — the enacted loop.
   One persona, one session: claim an SBT, get anchor signatures,
   submit research, post builds to the tally, vote, invest.
   ══════════════════════════════════════════════════════════════ */

export interface TallyBuild {
  name: string;
  by: string;
  backers: number;
  pledged: number;
}

export interface TallyNumbers {
  for: number;
  against: number;
  pledged: number;
  backers: number;
  builds: TallyBuild[];
}

export interface ResearchEntry {
  title: string;
  by: string;
  time: string;
}

interface Session {
  me: LedgerEntry | null;
  claim: (name: string) => void;
  activity: OntoActivity[];
  signatures: Record<string, { by: string }[]>;
  anchor: (pageId: string, pageName: string) => void;
  research: ResearchEntry[];
  submitResearch: (title: string) => void;
  tally: TallyNumbers;
  postToTally: (buildName: string) => void;
  vote: (side: 'for' | 'against') => void;
  invest: () => void;
}

const SessionCtx = createContext<Session | null>(null);

export function SessionProvider({
  toast,
  children,
}: {
  toast: (msg: string, icon?: string) => void;
  children: ReactNode;
}) {
  const [me, setMe] = useState<LedgerEntry | null>(null);
  const [extra, setExtra] = useState<OntoActivity[]>([]);
  const [sigs, setSigs] = useState<Record<string, { by: string }[]>>({});
  const [research, setResearch] = useState<ResearchEntry[]>([]);
  const [tally, setTally] = useState<TallyNumbers>({
    for: 214,
    against: 38,
    pledged: 1200000,
    backers: 41,
    builds: [],
  });

  const push = useCallback((p: string, state: OntoActivity['state'], time = 'now') => {
    setExtra(prev => [{ p, state, time }, ...prev]);
  }, []);

  // The loop starts here: nothing enacts without an identity.
  const gate = useCallback((): string | null => {
    if (me) return me.name;
    toast('claim your identity SBT first — ⌘1 kernel', '⚠');
    return null;
  }, [me, toast]);

  const claim = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setMe({
      av: (clean[0] || 'y').toUpperCase(),
      name: clean,
      role: 'builder · just claimed',
      rights: ['build', 'vote'],
      sbt: 'SBT-0207',
      color: 'linear-gradient(135deg,var(--accent),var(--cyan))',
    });
    push(`${clean} claimed identity SBT-0207 — soulbound, unsellable`, 'built');
    toast(`◈ SBT-0207 issued · welcome to the roll, ${clean}`, '◈');
  }, [push, toast]);

  const anchor = useCallback((pageId: string, pageName: string) => {
    const who = gate();
    if (!who) return;
    setSigs(prev => ({ ...prev, [pageId]: [...(prev[pageId] || []), { by: 'wanjiru.m' }] }));
    push(`wanjiru.m anchored ${pageName} — skill verified on the roll`, 'built');
    toast(`⚿ wanjiru.m signed ${pageName} · skill verified`, '✓');
  }, [gate, push, toast]);

  const submitResearch = useCallback((title: string) => {
    const clean = title.trim();
    const who = gate();
    if (!who || !clean) return;
    setResearch(prev => [{ title: clean, by: who, time: 'now' }, ...prev]);
    push(`you submitted research to the laboratory: ${clean}`, 'proto');
    toast(`◎ research submitted · ${clean}`, '◎');
  }, [gate, push, toast]);

  const postToTally = useCallback((buildName: string) => {
    const who = gate();
    if (!who) return;
    setTally(prev => ({
      ...prev,
      builds: [...prev.builds, { name: buildName, by: who, backers: 1, pledged: 500 }],
    }));
    push(`you posted ${buildName} to the tally — open for collaborators and funds`, 'planned');
    toast(`▤ ${buildName} on the tally · collaborators welcome`, '▤');
  }, [gate, push, toast]);

  const vote = useCallback((side: 'for' | 'against') => {
    const who = gate();
    if (!who) return;
    setTally(prev => ({ ...prev, [side]: prev[side] + 1 }));
    push(`you voted ${side} on the SMIS tally — one SBT, one vote`, 'built');
    toast(`◈ vote recorded · ${side}`, '◈');
  }, [gate, push, toast]);

  const invest = useCallback(() => {
    const who = gate();
    if (!who) return;
    setTally(prev => ({ ...prev, pledged: prev.pledged + 500, backers: prev.backers + 1 }));
    push('you invested KES 500 into the SMIS tally — returns flow to The Roll, pro-rata', 'planned');
    toast('◆ KES 500 pledged · pro-rata to The Roll', '◆');
  }, [gate, push, toast]);

  const activity = useMemo(() => [...extra, ...ACTIVITY], [extra]);

  const value = useMemo<Session>(() => ({
    me,
    claim,
    activity,
    signatures: sigs,
    anchor,
    research,
    submitResearch,
    tally,
    postToTally,
    vote,
    invest,
  }), [me, claim, activity, sigs, anchor, research, submitResearch, tally, postToTally, vote, invest]);

  return <SessionCtx.Provider value={value}>{children}</SessionCtx.Provider>;
}

export function useSession(): Session {
  const s = useContext(SessionCtx);
  if (!s) throw new Error('useSession must be used inside <SessionProvider>');
  return s;
}
