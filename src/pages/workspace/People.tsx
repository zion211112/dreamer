import { WorkspaceLayout } from './WorkspaceLayout';

const mockPeople = [
  { name: 'Mara Santos', role: 'Systems Designer', location: 'Lisbon', avatar: 'MS' },
  { name: 'Kenji Tanaka', role: 'Infrastructure Engineer', location: 'Kyoto', avatar: 'KT' },
  { name: 'Aisha Okafor', role: 'Community Organizer', location: 'Lagos', avatar: 'AO' },
];

export function People() {
  return (
    <WorkspaceLayout currentContext="people">
      <div style={{ maxWidth: '100%' }}>
        <header style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ 
            font: '400 clamp(28px, 3vw, 42px)/1.05 var(--serif)', 
            letterSpacing: '-.035em',
            margin: '0 0 var(--space-2)',
          }}>
            People <span style={{ color: 'var(--terrain)' }}>— Skill in motion</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--step--1)', margin: 0 }}>
            Network directory coming soon
          </p>
        </header>

        <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {mockPeople.map((person) => (
            <div key={person.name} style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-3)',
              padding: 'var(--space-4)',
              background: 'var(--bg-elev)',
              transition: 'border-color var(--fast), box-shadow var(--fast)',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-3)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--terrain-pale)',
                  color: 'var(--terrain)',
                  display: 'grid',
                  placeItems: 'center',
                  font: '600 16px var(--mono)',
                }}>
                  {person.avatar}
                </div>
                <div>
                  <strong style={{ font: '500 16px var(--serif)', display: 'block' }}>{person.name}</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: 'var(--step--1)' }}>{person.role}</span>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-2)',
                color: 'var(--text-faint)',
                fontSize: 'var(--step--2)',
                fontFamily: 'var(--mono)',
              }}>
                <span>📍</span>
                <span>{person.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
