import Link from 'next/link'
import { MODULES, MODULE_ORDER, TREE, TOTAL_BUILDS, BUILT_COUNT, ANCHORS } from '@/lib/ontology'

export default function Workspace() {
  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: 'var(--accent)' }}>◇</div>
          <div>
            <h1 className="font-display">workspace</h1>
            <div className="desc">five-department dashboard — module status, builds, and the roll</div>
          </div>
        </div>
        <div className="updated">last updated: just now</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>total builds</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginTop: '6px' }}>{TOTAL_BUILDS}</div>
        </div>
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>built</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)', marginTop: '6px' }}>{BUILT_COUNT}</div>
        </div>
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>anchors</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--cyan)', marginTop: '6px' }}>{ANCHORS}</div>
        </div>
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>pages</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', marginTop: '6px' }}>{Object.values(TREE).reduce((sum, m) => sum + m.pages.length, 0)}</div>
        </div>
      </div>

      <section className="section">
        <div className="section-label">modules</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {MODULE_ORDER.map(id => {
            const m = MODULES[id]
            const pages = TREE[id].pages
            const built = pages.filter(p => p.state === 'built').length
            return (
              <div key={id} style={{ padding: '18px', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: m.color, color: '#0a0a0b', display: 'grid', placeItems: 'center', fontWeight: '700' }}>{m.icon}</div>
                  <Link href={`/${id}`} style={{ color: 'inherit', fontSize: '18px', fontFamily: 'var(--font-serif)', fontWeight: '600' }}>{m.label}</Link>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--fg-muted)', lineHeight: '1.5' }}>{m.desc}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>
                  <span>{pages.length} pages</span>
                  <span>{built} built</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}