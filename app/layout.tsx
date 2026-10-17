import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/lib/session'
import TopNav from '@/components/TopNav'

export const metadata: Metadata = {
  title: 'workspace — file manager for systems thinkers',
  description: 'A keyboard-driven file manager with a five-department ontology. Built for humans who think in systems.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[var(--bg)] text-[var(--fg)] antialiased">
        <div className="aurora" />
        <div className="relative z-10 h-full">
          <TopNav />
          <div className="pt-[40px]">
            <SessionProvider>{children}</SessionProvider>
          </div>
        </div>
      </body>
    </html>
  )
}