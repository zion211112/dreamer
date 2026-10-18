import type { Metadata } from 'next';
import '../src/styles.css';

export const metadata: Metadata = {
  title: 'APT-LABS — A market for things worth making',
  description: 'Open Tenders connect local demand, capital and crews. Compare the import quote, local bill of materials and proof of completed builds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
