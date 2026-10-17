import { highlight } from '@/lib/editor'
import { findPage, stateColor } from '@/lib/ontology'

export default function PageView({ params }: { params: { module: string; slug: string[] } }) {
  const id = `${params.module}/${params.slug.join('/')}`
  const f = findPage(id)
  if (!f) return <div className="main">Page not found</div>

  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: f.state === 'built' ? 'var(--green)' : 'var(--fg-muted)' }}>{f.state[0]}</div>
          <div>
            <div className="crumb" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--fg-muted)' }}>{f.module} / {f.id.split('/').slice(1).join('/')}</div>
            <h1 className="font-display">{f.name}</h1>
            <div className="desc" style={{ fontSize: '11px' }}>{f.lang} · {f.lines} lines · {f.size}</div>
          </div>
        </div>
        <div className="updated">
          <span className={`state-pill ${f.state}`}>{f.state}</span>
        </div>
      </div>

      <section className="section" style={{ maxWidth: '100%' }}>
        <div className="editor">
          <div className="editor-tabs">
            <div className="editor-tab">
              <span className="dot-state" style={{ background: stateColor(f.state) }} />
              {f.name}
            </div>
          </div>
          <div className="editor-body">
            <div className="editor-gutter" dangerouslySetInnerHTML={{ __html: Array.from({ length: f.lines }, (_, i) => i + 1).join('<br>') }} />
            <div className="editor-code" dangerouslySetInnerHTML={{ __html: highlight(f.content, f.lang) }} />
          </div>
        </div>
      </section>
    </main>
  )
}