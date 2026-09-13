import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display, Fraunces, IBM_Plex_Sans } from "next/font/google";
import { Gate } from "../components/AuthGate";
import { Nav } from "../components/Nav";
import Link from "next/link";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-playfair" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-fraunces" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "APT-LABS — We're making a list.",
  description:
    "The APT-LABS ledger: everyone in Kirinyaga who can actually do things. Build capacity, verify capability. Lose your certificate? We kept the hash.",
  keywords: ["APT-LABS", "Kirinyaga", "skills ledger", "teachers", "youth jobs"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable} ${jetbrains.variable} ${fraunces.variable} ${plex.variable} bg-obsidian text-ivory font-body antialiased`}>
        <Nav />
        <Gate>{children}</Gate>
        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row justify-between gap-3 text-sm text-muted">
            <span>APT-LABS · Kirinyaga, Kenya</span>
            <span className="flex gap-5">
              <Link href="/" className="hover:text-ivory">Home</Link>
              <Link href="/contact" className="hover:text-ivory">Contact</Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
