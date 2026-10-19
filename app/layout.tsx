import type { Metadata } from 'next';
import '../src/styles.css';

export const metadata: Metadata = {
  title: 'APT-LABS — Sovereign Asset Generation',
  description: 'Community infrastructure, transparent capital allocation, accountable crews, and verified proof of work.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
