import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "APT-LABS — The ledger of useful work.",
    template: "%s — APT-LABS",
  },
  description:
    "A public record of work, skill, and trust. Built for places where the network is a suggestion, not a guarantee.",
  keywords: ["ledger", "skills", "community", "local-first", "offline"],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='4' fill='%23060708'/><text x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='16' font-weight='700' fill='%2314B8A6'>A</text></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#060708" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
