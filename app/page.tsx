import Link from 'next/link'
import { MODULES, MODULE_ORDER, PEOPLE, LEDGER, TOTAL_BUILDS, BUILT_COUNT, ANCHORS } from '@/lib/ontology'

export default function Home() {
  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: 'var(--accent)' }}>◇</div>
          <div>
            <h1 className="font-display">the record</h1>
            <div className="desc">the aptlabs landing — one page, everything plain</div>
          </div>
        </div>
        <div className="updated">sovereign · open · on the roll</div>
      </div>

      <section className="section hero">
        <div className="section-label">the landing</div>
        <h2 className="font-display" style={{ fontSize: '28px', lineHeight: '1.2' }}>
          Sovereign work.<br /><em>The record, ours.</em>
        </h2>
        <p className="lede" style={{ maxWidth: '56ch', color: 'var(--fg-muted)', marginTop: '12px', fontSize: '14px', lineHeight: '1.6' }}>
          A closed-loop execution stack translating community intent into physical and computational reality.
        </p>
        <div className="cta" style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/kernel" className="btn btn-primary">Claim your identity SBT →</Link>
          <Link href="/workspace" className="btn btn-ghost">Enter the workspace</Link>
          <Link href="/network" className="btn btn-ghost">SMIS · live vote</Link>
        </div>
      </section>
    </main>
  )
}