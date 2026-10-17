import Link from 'next/link'
import { MODULES, TREE, stateColor } from '@/lib/ontology'

export default function ModulePage({ params }: { params: { module: string } }) {
  const mod = MODULES[params.module]
  const pages = TREE[params.module]?.pages || []
  if (!mod) return <div className="main">Module not found</div>

  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: mod.color }}>{mod.icon}</div>
          <div>
            <h1 className="font-display">{mod.label}</h1>
            <div className="desc">{mod.desc}</div>
          </div>
        </div>
        <div className="updated">{pages.length} pages</div>
      </div>

      <section className="section">
        <div className="section-label">pages</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {pages.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span className="state-pill" style={{ fontSize: '9px', padding: '1px 6px' }} className={`state-pill ${p.state}`}>{p.state}</span>
              <Link href={`/${params.module}/${p.id.split('/').slice(1).join('/')}`} style={{ color: 'var(--fg)', fontFamily: 'var(--font-serif)', fontSize: '14px', fontWeight: '600' }}>{p.name}</Link>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--fg-dim)' }}>{p.size}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}