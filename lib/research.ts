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
    title: "Receipts > reports: a ledger model for rural learning",
    meta: "2026 · 8 pages · field data, Kirinyaga",
    abstract: "Grades evaporate. Hashes don't. Fifty learners, daily questions, sealed records. Headteachers believed the PDF more than the report card. Small science. Very practical."
  },
  {
    id: "K-02",
    title: "What sunflowers know about attention",
    meta: "2026 · 6 pages · geometry + teaching",
    abstract: "Five-minute drills, spaced like seeds. Early signal: +22% recall. Same math, fewer bees."
  },
  {
    id: "K-03",
    title: "Goats vs unicorns: a practical youth economy",
    meta: "2026 · 10 pages · cooperatives + M-Pesa",
    abstract: "Unicorns need venture capital. Goats need grass. Real KES 50,000 modeled: who earned, who learned, who maintains the tools."
  }
];
