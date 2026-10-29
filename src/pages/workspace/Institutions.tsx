import { WorkspaceLayout } from './WorkspaceLayout';

const mockInstitutions = [
  { name: 'MWEA Animation Studio', type: 'Creative Collective', location: 'Nairobi', since: '2022' },
  { name: 'Cooperative Housing Trust', type: 'Housing Cooperative', location: 'Berlin', since: '2019' },
  { name: 'Solar Commons Initiative', type: 'Energy Cooperative', location: 'Oaxaca', since: '2023' },
];

export function Institutions() {
  return (
    <WorkspaceLayout currentContext="institutions">
      <div style={{ maxWidth: '100%' }}>
        <header style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ 
            font: '400 clamp(28px, 3vw, 42px)/1.05 var(--serif)', 
            letterSpacing: '-.035em',
            margin: '0 0 var(--space-2)',
          }}>
            Institutions <span style={{ color: 'var(--brass)' }}>— Purposeful backing</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--step--1)', margin: 0 }}>
            Institution registry coming soon
          </p>
        </header>

        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {mockInstitutions.map((inst) => (
            <div key={inst.name} style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-3)',
              padding: 'var(--space-4)',
              background: 'var(--bg-elev)',
              transition: 'border-color var(--fast), box-shadow var(--fast)',
            }}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <strong style={{ font: '500 18px var(--serif)', display: 'block' }}>{inst.name}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--step--1)' }}>{inst.type}</span>
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
                  <span>📍</span>
                  <span>{inst.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span>📅</span>
                  <span>Since {inst.since}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
