'use client'

import { useSession } from '@/lib/session'

export default function Tally() {
  const { tally, vote, invest } = useSession()
  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: 'var(--green)' }}>◉</div>
          <div>
            <h1 className="font-display">smis tally</h1>
            <div className="desc">live ballot — one SBT, one vote</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>for</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', color: 'var(--green)', marginTop: '4px' }}>{tally.for}</div>
        </div>
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>against</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '40px', color: 'var(--red)', marginTop: '4px' }}>{tally.against}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>investment</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--amber)', marginTop: '4px' }}>KES {tally.pledged.toLocaleString()} of 2,000,000</div>
        <div style={{ fontSize: '11px', color: 'var(--fg-muted)', marginTop: '4px' }}>{tally.backers} backers · smallest stake KES 500</div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => vote('for')} className="btn btn-primary">vote for</button>
        <button onClick={() => vote('against')} className="btn btn-ghost">vote against</button>
        <button onClick={invest} className="btn btn-ghost">invest KES 500</button>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {tally.builds.map((b, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-hover)', borderRadius: '6px', fontSize: '11.5px' }}>
            <span>{b.name}</span>
            <span>{b.backers} backers · KES {b.pledged.toLocaleString()}</span>
          </div>
        ))}
        {tally.builds.length === 0 && (
          <div style={{ padding: '12px', color: 'var(--fg-muted)', fontSize: '11.5px' }}>no builds posted yet — post one from builds ▤</div>
        )}
      </div>
    </main>
  )
}