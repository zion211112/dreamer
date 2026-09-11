import { Cormorant_Garamond } from "next/font/google";
import "./forest.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-cormorant" });

// Forest scope: Cormorant for headings, its own palette and motion.
// The global Gate still guards every route under here.
export default function ZepTepiLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${cormorant.variable} forest forest-fade`}>{children}</div>;
}
