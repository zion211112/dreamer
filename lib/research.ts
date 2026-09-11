// Research shelf, migrated from the deleted Kemet-OS route.
// Papers live on the Cold Shelf now: searchable, never browsed as a feed.
export type Paper = {
  id: string;
  title: string;
  meta: string;
  abstract: string;
};

export const PAPERS: Paper[] = [
  {
    id: "K-01",
    title: "RECURSIVE DENSITY, BIFURCATION, RECURSIVE ZEROING AND CRYSTALIZATION: PRACTICAL APPLICATIONS",
    meta: "2026 · 12 pages · systems + recursion",
    abstract: "Density schedules, bifurcation points, zeroing loops, crystal records. The math the ledger runs on, written plain enough to argue with."
  },
  {
    id: "K-02",
    title: "What sunflowers know about attention",
    meta: "2026 · 6 pages · geometry + teaching",
    abstract: "Same math, fewer bees."
  },
  {
    id: "K-03",
    title: "Goats vs unicorns: a practical youth economy",
    meta: "2026 · 10 pages · cooperatives + NYOTA",
    abstract: "Unicorns need venture capital. Goats need grass. Real KES 50,000 modeled: who earned, who learned, who maintains the tools."
  }
];
