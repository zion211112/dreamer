'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MODULES, MODULE_ORDER } from '@/lib/ontology'

export default function TopNav() {
  const pathname = usePathname() ?? '/'
  return (
    <nav className="fixed top-0 left-0 right-0 z-20 h-10 border-b" style={{ height: '40px', background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>
      <div className="flex h-full items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-8 px-3 py-1 font-mono transition-colors" style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
          <span style={{ fontSize: '10px' }}>◇</span>
          <span className="font-display">apt-labs</span>
        </Link>
        {MODULE_ORDER.map(id => {
          const m = MODULES[id]
          const active = pathname === '/' + id || pathname.startsWith('/' + id + '/')
          return (
            <Link
              key={id}
              href={'/' + id}
              className="flex items-center gap-6 px-3 py-1 font-mono transition-colors"
              style={{
                fontSize: '11px',
                borderRadius: '6px',
                color: active ? 'var(--fg)' : 'var(--fg-muted)',
                background: active ? 'var(--bg-hover)' : 'transparent',
                border: active ? '1px solid var(--border)' : '1px solid transparent',
              }}
            >
              <span style={{ fontSize: '10px' }}>{m.icon}</span>
              {m.label}
            </Link>
          )
        })}
        <div className="ml-auto flex items-center gap-2">
          <Link href="/workspace" className="flex items-center gap-6 px-3 py-1 font-mono transition-colors" style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
            <span style={{ fontSize: '10px' }}>▤</span>
            workspace
          </Link>
          <Link href="/claim" className="flex items-center gap-6 px-3 py-1 font-mono transition-colors" style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
            <span style={{ fontSize: '10px' }}>⌘</span>
            claim
          </Link>
          <Link href="/tally" className="flex items-center gap-6 px-3 py-1 font-mono transition-colors" style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
            <span style={{ fontSize: '10px' }}>◉</span>
            tally
          </Link>
        </div>
      </div>
    </nav>
  )
}
