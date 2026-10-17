'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MODULES, MODULE_ORDER } from '@/lib/ontology'

export default function TopNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed top-0 left-0 right-0 h-[40px] bg-[var(--bg-raised)] border-b border-[var(--border)] z-20">
      <div className="flex items-center gap-2 px-4 h-full">
        <Link href="/" className="flex items-center gap-8 px-3 py-1 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-md hover:bg-[var(--bg-hover)]">
          <span style={{ fontSize: '10px' }}>◇</span>
          <span className="font-display">apt-labs</span>
        </Link>
        {MODULE_ORDER.map(id => {
          const m = MODULES[id]
          const active = pathname === `/${id}` || pathname.startsWith(`/${id}/`)
          return (
            <Link key={id} href={`/${id}`} className={`flex items-center gap-6 px-3 py-1 text-xs font-mono rounded-md transition-colors ${active ? 'bg-[var(--bg-hover)] text-[var(--fg)] border border-[var(--border)]' : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-hover)]'` }>
              <span style={{ fontSize: '10px' }}>{m.icon}</span>
              {m.label}
            </Link>
          )
        })}
        <Link href="/workspace" className="ml-auto flex items-center gap-6 px-3 py-1 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-md hover:bg-[var(--bg-hover)]">
          <span style={{ fontSize: '10px' }}>▤</span>
          workspace
        </Link>
        <Link href="/claim" className="flex items-center gap-6 px-3 py-1 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-md hover:bg-[var(--bg-hover)]">
          <span style={{ fontSize: '10px' }}>⌘</span>
          claim
        </Link>
        <Link href="/tally" className="flex items-center gap-6 px-3 py-1 text-xs font-mono text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors rounded-md hover:bg-[var(--bg-hover)]">
          <span style={{ fontSize: '10px' }}>◉</span>
          tally
        </Link>
      </div>
    </nav>
  )
}