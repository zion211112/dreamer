import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "newprotoshell — the quiet workspace",
  description: "A file-manager-inspired workspace: files, builds, tenders, console, vault.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07090d] font-sans antialiased">{children}</body>
    </html>
  );
}
