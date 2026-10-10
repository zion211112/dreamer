import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'proto.shell — orchestrator interface for everyone',
  description: 'A witty, expert, enterprise-grade file manager interface. Built for humans who think in systems.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-[var(--bg)] text-[var(--fg)] antialiased grid-pattern">
        {children}
      </body>
    </html>
  );
}