"use client";

// The public site chrome — header, content column, footer.
//
// It is withheld on exactly one route: the protocol node at "/", which is the
// product and owns the whole viewport. Stacking the marketing header above a
// fixed control plane doubled the navigation and buried the node's own panel
// behind it, so the node renders bare and carries its own shell instead
// (sidebar: control plane, execution, support routes).
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY } from "../lib/company";
import { Nav } from "./Nav";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/roll", label: "Roll" },
  { href: "/about", label: "About" },
  { href: "/evidence", label: "Evidence" },
  { href: "/contact", label: "Contact" },
];

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") return <>{children}</>;

  return (
    <>
      <Nav />
      <div className="site-content">{children}</div>
      <footer className="site-footer" role="contentinfo">
        <div className="site-footer-inner">
          <div className="site-footer-brand">
            <span className="site-footer-mark" aria-hidden="true">A</span>
            <span className="site-footer-name">{COMPANY.name}</span>
            <span className="site-footer-loc">{COMPANY.geography.text}</span>
          </div>
          <nav aria-label="Footer" className="site-footer-links">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="site-footer-link">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="site-footer-copy">
            The node is the product. Records are the substrate.
          </p>
        </div>
      </footer>
    </>
  );
}
