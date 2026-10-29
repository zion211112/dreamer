import { useSignal } from '@preact/signals';
import { useLocation } from 'wouter';

const contexts = [
  { id: 'people', label: 'People', subtitle: 'Skill in motion', path: '/workspace/people' },
  { id: 'institutions', label: 'Institutions', subtitle: 'Purposeful backing', path: '/workspace/institutions' },
  { id: 'commons', label: 'Commons', subtitle: 'Work that stands', path: '/workspace/commons' },
  { id: 'workbench', label: 'Workbench', subtitle: 'Make work legible', path: '/workspace/workbench' },
];

export function WorkspaceContextSwitcher() {
  const [, navigate] = useLocation();
  
  const getCurrentContext = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('workspaceContext');
      if (stored) return stored;
      const path = window.location.pathname;
      if (path.includes('/workspace/')) {
        return path.split('/workspace/')[1] || 'people';
      }
    }
    return 'people';
  };

  const currentContext = useSignal(getCurrentContext());

  const handleContextChange = (contextId: string) => {
    currentContext.value = contextId;
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspaceContext', contextId);
    }
    navigate(contexts.find(c => c.id === contextId)?.path || '/workspace/people');
  };

  return (
    <nav className="workspace-context-switcher" style={{
      display: 'flex',
      gap: 'var(--space-1)',
      borderBottom: '1px solid var(--border)',
      paddingBottom: 'var(--space-2)',
    }} aria-label="Workspace context">
      {contexts.map((ctx) => (
        <button
          key={ctx.id}
          onClick={() => handleContextChange(ctx.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '2px',
            padding: 'var(--space-2) var(--space-3)',
            border: '1px solid transparent',
            borderRadius: 'var(--radius-2)',
            background: currentContext.value === ctx.id 
              ? 'var(--terrain-pale)' 
              : 'transparent',
            color: currentContext.value === ctx.id 
              ? 'var(--terrain-ink)' 
              : 'var(--text-muted)',
            borderColor: currentContext.value === ctx.id
              ? 'color-mix(in srgb, var(--terrain) 28%, var(--border))'
              : 'transparent',
            cursor: 'pointer',
            font: '500 var(--step--1)/1 var(--sans)',
            whiteSpace: 'nowrap',
            transition: 'all var(--fast)',
            textAlign: 'left',
          }}
          aria-current={currentContext.value === ctx.id ? 'page' : undefined}
        >
          <span style={{ fontWeight: '600' }}>{ctx.label}</span>
          <span style={{ 
            fontSize: 'var(--step--2)', 
            color: currentContext.value === ctx.id ? 'var(--terrain)' : 'var(--text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {ctx.subtitle}
          </span>
        </button>
      ))}
    </nav>
  );
}
