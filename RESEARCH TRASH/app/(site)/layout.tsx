import { SiteFrame } from "../../components/SiteFrame";
import "../site.css";

// The site chrome lives in a client frame so the one route that is a product
// rather than a page — the protocol node at "/" — can opt out of it.
// The Organization JSON-LD moved to app/layout.tsx: it is site-wide identity,
// and the node at "/" no longer passes through this layout's markup.
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteFrame>{children}</SiteFrame>;
}


