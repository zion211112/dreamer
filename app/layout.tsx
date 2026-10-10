import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'workspace — file manager for systems thinkers',
  description: 'A keyboard-driven file manager with a five-department ontology. Built for humans who think in systems.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[var(--bg)] text-[var(--fg)] antialiased">
        <div className="aurora" />
        <div className="relative z-10 h-full">{children}</div>
      </body>
    </html>
  );
}
