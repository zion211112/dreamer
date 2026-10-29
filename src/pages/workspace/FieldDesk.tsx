import { useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card, CardBody } from '../../components/Card';

const INSTITUTIONS = [
  { id: 'mwea', name: 'MWEA Animation Studio', kind: 'Creative Collective' },
  { id: 'housing', name: 'Cooperative Housing Trust', kind: 'Housing Cooperative' },
  { id: 'solar', name: 'Solar Commons Initiative', kind: 'Energy Cooperative' },
] as const;

const CREW_ROLES = ['anchor', 'builder', 'apprentice'] as const;
const CATEGORIES = ['education', 'energy', 'media', 'agriculture', 'infrastructure', 'software'] as const;

const PEOPLE = [
  { id: 'p1', name: 'Aisha Okafor', archetype: 'developer', institution: 'dev2027ke' },
  { id: 'p2', name: 'Kenji Tanaka', archetype: 'builder', institution: 'Cooperative Housing Trust' },
  { id: 'p3', name: 'Mara Mensah', archetype: 'organizer', institution: 'MWEA Animation Studio' },
  { id: 'p4', name: 'Kwame Silva', archetype: 'dropout', institution: 'Solar Commons Initiative' },
  { id: 'p5', name: 'Yara Hernandez', archetype: 'graduate', institution: 'MWEA Animation Studio' },
  { id: 'p6', name: 'Takeshi Sato', archetype: 'researcher', institution: 'dev2027ke' },
  { id: 'p7', name: 'Nia Wanjiru', archetype: 'socializer', institution: 'Nairobi Tech Collective' },
  { id: 'p8', name: 'Mateo Garcia', archetype: 'builder', institution: 'Berlin Housing Coop' },
  { id: 'p9', name: 'Leila Patel', archetype: 'organizer', institution: 'Open Design Library' },
  { id: 'p10', name: 'Omar Ali', archetype: 'researcher', institution: 'Field Desk Labs' },
] as const;

const COMMONS = [
  { id: 'design-lib', name: 'Open Design Library', type: 'Shared Resources' },
  { id: 'land-trust', name: 'Community Land Trust', type: 'Land Commons' },
  { id: 'knowledge', name: 'Knowledge Repository', type: 'Documentation' },
] as const;

type Step = 'issuer' | 'crew' | 'tender' | 'done';

interface FormData {
  issuer: string;
  commonsRef: string;
  crew: { anchor: string; builder: string; apprentice: string };
  tender: {
    slug: string;
    asset_name: string;
    summary: string;
    category: string;
    location: string;
    local_bom_minor: number;
  };
}

const initialData: FormData = {
  issuer: '',
  commonsRef: '',
  crew: { anchor: '', builder: '', apprentice: '' },
  tender: { slug: '', asset_name: '', summary: '', category: 'education', location: '', local_bom_minor: 0 },
};

function availableForRole(data: FormData, role: string) {
  return PEOPLE.filter(p => !Object.values(data.crew).includes(p.id) || data.crew[role as keyof typeof data.crew] === p.id);
}

function getPersonName(id: string) {
  return PEOPLE.find(p => p.id === id)?.name || id;
}

function getInstitutionName(id: string) {
  return INSTITUTIONS.find(i => i.id === id)?.name || id;
}

function getCommonsName(id: string) {
  return COMMONS.find(c => c.id === id)?.name || id;
}

const progressSteps = [
  { id: 'issuer' as Step, label: 'Issuer' },
  { id: 'crew' as Step, label: 'Crew' },
  { id: 'tender' as Step, label: 'Tender' },
];

export function FieldDesk() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>('issuer');
  const [data, setData] = useState<FormData>(initialData);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (step === 'issuer' && data.issuer) {
      setStep('crew');
    } else if (step === 'crew' && data.crew.anchor && data.crew.builder && data.crew.apprentice) {
      setStep('tender');
    } else if (step === 'tender' && data.tender.slug && data.tender.asset_name && data.tender.local_bom_minor > 0) {
      setStep('done');
      console.log('[FieldDesk] Tender authored:', {
        issuer: getInstitutionName(data.issuer),
        commonsRef: data.commonsRef ? getCommonsName(data.commonsRef) : 'none',
        crew: {
          anchor: getPersonName(data.crew.anchor),
          builder: getPersonName(data.crew.builder),
          apprentice: getPersonName(data.crew.apprentice),
        },
        tender: data.tender,
        status: 'draft',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const reset = () => {
    setStep('issuer');
    setData(initialData);
  };

  if (step === 'done') {
    return (
      <WorkspaceLayout currentContext="field-desk">
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>✓</div>
            <h2 style={{ font: '400 var(--step-4) var(--serif)', margin: '0 0 var(--space-2)' }}>Tender Authored</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 var(--space-6)' }}>
              <strong>{data.tender.asset_name}</strong> by <strong>{getInstitutionName(data.issuer)}</strong>
            </p>
          </div>

          <Card>
            <CardBody style={{ padding: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--step--1)', fontFamily: 'var(--mono)', lineHeight: '2', color: 'var(--text)' }}>
                <div><strong>slug:</strong> {data.tender.slug}</div>
                <div><strong>category:</strong> {data.tender.category}</div>
                <div><strong>location:</strong> {data.tender.location || '—'}</div>
                <div><strong>local BOM:</strong> {(data.tender.local_bom_minor / 100).toLocaleString()} KES</div>
                <div><strong>commons ref:</strong> {data.commonsRef ? getCommonsName(data.commonsRef) : 'none'}</div>
                <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)' }}>
                  <div><strong>anchor:</strong> {getPersonName(data.crew.anchor)}</div>
                  <div><strong>builder:</strong> {getPersonName(data.crew.builder)}</div>
                  <div><strong>apprentice:</strong> {getPersonName(data.crew.apprentice)}</div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-6)' }}>
            <Button variant="ghost" onClick={reset} style={{ minWidth: '140px' }}>New Tender</Button>
            <Button variant="primary" onClick={() => navigate('/workspace/people')} style={{ minWidth: '140px' }}>View People</Button>
          </div>

          <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--step--2)', color: 'var(--text-faint)', fontFamily: 'var(--mono)' }}>
            Stored locally · Connect Supabase to persist
          </p>
        </div>
      </WorkspaceLayout>
    );
  }

  const currentStepIndex = progressSteps.findIndex(s => s.id === step);

  return (
    <WorkspaceLayout currentContext="field-desk">
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 var(--space-4)' }}>
        <header style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
          <h1 style={{ font: '400 clamp(28px, 3vw, 42px)/1.05 var(--serif)', margin: '0 0 var(--space-2)' }}>
            Field Desk <span style={{ color: 'var(--terrain)' }}>— Atlas in hand</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Pick issuer → Assemble crew → Author tender → Deploy</p>
        </header>

        {/* Progress */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-6)',
          fontSize: 'var(--step--2)',
          fontFamily: 'var(--mono)',
          color: 'var(--text-muted)',
        }}>
          {progressSteps.map((s, i) => (
            <span
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: currentStepIndex >= i ? 'var(--terrain)' : 'var(--text-faint)',
                fontWeight: step === s.id ? 600 : 400,
              }}
            >
              <span style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: currentStepIndex >= i ? 'var(--terrain)' : 'var(--border)',
                background: currentStepIndex > i ? 'var(--terrain)' : 'transparent',
                display: 'grid',
                placeItems: 'center',
                fontSize: '10px',
                color: currentStepIndex > i ? 'var(--bg)' : 'inherit',
              }}>
                {currentStepIndex > i ? '✓' : (i + 1)}
              </span>
              {s.label}
            </span>
          ))}
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Step 1: Issuer + Commons Ref */}
              {step === 'issuer' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--step--2)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Issuing Institution</label>
                    <select
                      value={data.issuer}
                      onChange={(e: Event) => setData({...data, issuer: (e.target as HTMLSelectElement).value})}
                      style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', fontSize: 'var(--step-0)' }}
                    >
                      <option value="">Choose issuer…</option>
                      {INSTITUTIONS.map(i => <option key={i.id} value={i.id}>{i.name} — {i.kind}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--step--2)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Commons Reference (optional)</label>
                    <select
                      value={data.commonsRef}
                      onChange={(e: Event) => setData({...data, commonsRef: (e.target as HTMLSelectElement).value})}
                      style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', fontSize: 'var(--step-0)' }}
                    >
                      <option value="">No reference — start fresh</option>
                      {COMMONS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                    </select>
                  </div>
                </>
              )}

              {/* Step 2: Crew */}
              {step === 'crew' && (
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--step--2)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>Assemble Crew (from People)</label>
                  {CREW_ROLES.map(role => (
                    <div key={role} style={{ marginBottom: 'var(--space-3)' }}>
                      <label style={{ display: 'block', fontSize: 'var(--step--1)', marginBottom: '4px', textTransform: 'capitalize', fontWeight: 500 }}>{role}</label>
                      <select
                        value={data.crew[role]}
                        onChange={(e: Event) => setData({...data, crew: {...data.crew, [role]: (e.target as HTMLSelectElement).value}})}
                        style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', fontSize: 'var(--step-0)' }}
                      >
                        <option value="">Select {role}…</option>
                        {availableForRole(data, role).map(p => (
                          <option key={p.id} value={p.id}>{p.name} — {p.archetype} ({p.institution})</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Tender */}
              {step === 'tender' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--step--2)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>Tender Details</label>
                    <Input placeholder="school-console-v1" value={data.tender.slug} onChange={v => setData({...data, tender: {...data.tender, slug: v}})} required />
                    <Input placeholder="School Console v1" value={data.tender.asset_name} onChange={v => setData({...data, tender: {...data.tender, asset_name: v}})} required />
                    <Input placeholder="A local-first toolkit for the week teachers actually have." value={data.tender.summary} onChange={v => setData({...data, tender: {...data.tender, summary: v}})} required />
                    <select
                      value={data.tender.category}
                      onChange={(e: Event) => setData({...data, tender: {...data.tender, category: (e.target as HTMLSelectElement).value}})}
                      style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', fontSize: 'var(--step-0)' }}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Input placeholder="Nairobi, Kenya" value={data.tender.location} onChange={v => setData({...data, tender: {...data.tender, location: v}})} />
                    <Input
                      type="text"
                      placeholder="2400000 (minor units = 24,000 KES)"
                      value={String(data.tender.local_bom_minor)}
                      onChange={v => setData({...data, tender: {...data.tender, local_bom_minor: parseInt(v) || 0}})}
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                {step === 'issuer' ? 'Next: Assemble Crew' : step === 'crew' ? 'Next: Author Tender' : 'Deploy to Roll'}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </WorkspaceLayout>
  );
}
