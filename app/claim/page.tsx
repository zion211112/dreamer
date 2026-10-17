'use client'

import { useSession } from '@/lib/session'

export default function Claim() {
  const { claim, me } = useSession()
  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: 'var(--cyan)' }}>⌘</div>
          <div>
            <h1 className="font-display">claim identity</h1>
            <div className="desc">three moves — register, sign, receive your soulbound SBT</div>
          </div>
        </div>
      </div>

      {me ? (
        <div style={{ padding: '24px', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
          <div style={{ fontSize: '11px', color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>identity claimed</div>
          <div style={{ marginTop: '8px', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>{me.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px' }}>{me.sbt} · soulbound · unsellable</div>
        </div>
      ) : (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '16px', color: 'var(--fg-muted)', lineHeight: '1.6' }}>
            Open the kernel. Name yourself — no papers, no gatekeeper. Sign the claim with your wallet.
            An anchor countersigns. Your SBT lands in your wallet.
          </div>
          <input
            id="claim-name"
            type="text"
            placeholder="your name"
            className="w-full px-4 py-3 bg-[var(--bg-hover)] border border-[var(--border)] rounded-md text-[var(--fg)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={() => claim((document.getElementById('claim-name') as HTMLInputElement).value)}
            className="btn btn-primary w-full mt-4"
          >
            Claim SBT-0207 →
          </button>
        </div>
      )}
    </main>
  )
}