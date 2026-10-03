import type { Metadata } from "next";
import "./fonts.css";
import "./globals.css";
import { COMPANY } from "@/lib/system";

// The contract's supporting line is the site description, and the
// primary sentence is the title: those two strings are the memory
// target, so they are minted once in lib/system.ts and reused, never
// retyped per route.
export const metadata: Metadata = {
  title: {
    default: COMPANY.primary,
    template: "%s — APT-LABS",
  },
  description: COMPANY.supporting,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
