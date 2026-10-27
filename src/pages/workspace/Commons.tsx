import { WorkspaceLayout } from './WorkspaceLayout';

const mockCommons = [
  { name: 'Open Design Library', type: 'Shared Resources', items: '247 patterns', stewards: 12 },
  { name: 'Community Land Trust', type: 'Land Commons', items: '42 hectares', stewards: 8 },
  { name: 'Knowledge Repository', type: 'Documentation', items: '1,200+ guides', stewards: 24 },
];

export function Commons() {
  return (
    <WorkspaceLayout currentContext="commons">
      <div style={{ maxWidth: '100%' }}>
        <header style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ 
            font: '400 clamp(28px, 3vw, 42px)/1.05 var(--serif)', 
            letterSpacing: '-.035em',
            margin: '0 0 var(--space-2)',
          }}>
            Commons <span style={{ color: 'var(--water)' }}>— Work that stands</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--step--1)', margin: 0 }}>
            Shared resources coming soon
          </p>
        </header>

        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {mockCommons.map((comm) => (
            <div key={comm.name} style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-3)',
              padding: 'var(--space-4)',
              background: 'var(--bg-elev)',
              transition: 'border-color var(--fast), box-shadow var(--fast)',
            }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong style={{ font: '500 18px var(--serif)', display: 'block' }}>{comm.name}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--step--1)' }}>{comm.type}</span>
              </div>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'var(--space-4)',
                color: 'var(--text-faint)',
                fontSize: 'var(--step--2)',
                fontFamily: 'var(--mono)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span>📦</span>
                  <span>{comm.items}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span>👥</span>
                  <span>{comm.stewards} stewards</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
