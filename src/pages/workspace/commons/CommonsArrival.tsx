import { useState } from 'preact/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Provenance = 'verified' | 'firsthand' | 'community' | 'expert' | 'proposal';

const PROVENANCE: Record<Provenance, { label: string; accent: string; textClass: string }> = {
  verified: { label: 'Verified evidence', accent: 'state-canon', textClass: 'text-state-canon' },
  firsthand: { label: 'First-hand experience', accent: 'sage', textClass: 'text-sage' },
  community: { label: 'Community contribution', accent: 'lilac', textClass: 'text-lilac' },
  expert: { label: 'Expert interpretation', accent: 'forest', textClass: 'text-forest' },
  proposal: { label: 'Proposal', accent: 'peach', textClass: 'text-peach' },
};

interface PathCard {
  id: string;
  title: string;
  provenance: Provenance;
  icon: string;
}

const PATHS: PathCard[] = [
  { id: 'discover', title: 'Discover', provenance: 'verified', icon: '*' },
  { id: 'guides', title: 'Find guides', provenance: 'firsthand', icon: '>' },
  { id: 'community', title: 'Explore contributions', provenance: 'community', icon: 'x' },
  { id: 'undertakings', title: 'Learn from others', provenance: 'expert', icon: '=' },
  { id: 'share', title: 'Share', provenance: 'proposal', icon: '>' },
];

interface OutcomeCard {
  icon: string;
  title: string;
}

const OUTCOMES: OutcomeCard[] = [
  { icon: '⌘', title: 'Save' },
  { icon: '>', title: 'Create Brief' },
  { icon: 'x', title: 'Collect' },
  { icon: '*', title: 'Connect with contributor' },
  { icon: '=', title: 'Carry into Workbench' },
];

interface CommonsArrivalProps {
  onExplore: (query: string) => void;
  onOpenPath: (id: string) => void;
}

export function CommonsArrival({ onExplore, onOpenPath }: CommonsArrivalProps) {
  const [query, setQuery] = useState('');

  function handleExplore(event: Event) {
    event.preventDefault();
    onExplore(query.trim());
  }

  return (
    <section className="commons-arrival" data-module="commons">
      <header className="commons-arrival-head">
        <div className="commons-arrival-eyebrow">Commons</div>
        <h1 className="commons-arrival-title">What are you trying to understand or make possible?</h1>
      </header>

      <form className="commons-arrival-invitation" onSubmit={handleExplore} noValidate>
        <label className="commons-arrival-label" htmlFor="commons-intention">
          What are you trying to figure out?
        </label>
        <div className="commons-arrival-input-group">
          <Input
            id="commons-intention"
            type="text"
            value={query}
            onInput={event => setQuery((event.target as HTMLInputElement).value)}
            placeholder="e.g. How do small cooperatives organise produce collection and payments?"
            className="commons-arrival-input"
          />
          <Button variant="primary" size="lg" type="submit">
            Explore
          </Button>
        </div>
      </form>

      <section className="commons-arrival-paths">
        <div className="commons-arrival-paths-grid">
          {PATHS.map(path => (
            <CommonsPathCard key={path.id} path={path} onClick={() => onOpenPath(path.id)} />
          ))}
        </div>
      </section>

      <section className="commons-arrival-provenance">
        <div className="commons-arrival-provenance-grid">
          {Object.entries(PROVENANCE).map(([key, item]) => (
            <CommonsProvenanceBadge
              key={key}
              label={item.label}
              accent={item.accent}
              textClass={item.textClass}
            />
          ))}
        </div>
      </section>

      <section className="commons-arrival-outcomes">
        <div className="commons-arrival-outcomes-grid">
          {OUTCOMES.map((outcome) => (
            <CommonsOutcomeCard key={outcome.title} outcome={outcome} />
          ))}
        </div>
      </section>
    </section>
  );
}

function CommonsPathCard({ path, onClick }: { path: PathCard; onClick: () => void }) {
  return (
    <article
      className="commons-arrival-path-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="commons-arrival-path-icon">{path.icon}</div>
      <div className="commons-arrival-path-copy">
        <h3 className="commons-arrival-path-title">{path.title}</h3>
      </div>
    </article>
  );
}

function CommonsProvenanceBadge({ label, accent, textClass }: { label: string; accent: string; textClass: string }) {
  return (
    <span className={`commons-arrival-provenance-badge ${textClass}`} style={{ color: `var(--color-${accent})` }}>
      {label}
    </span>
  );
}

function CommonsOutcomeCard({ outcome }: { outcome: OutcomeCard }) {
  return (
    <article className="commons-arrival-outcome-card">
      <div className="commons-arrival-outcome-icon">{outcome.icon}</div>
      <div className="commons-arrival-outcome-copy">
        <h3 className="commons-arrival-outcome-title">{outcome.title}</h3>
      </div>
    </article>
  );
}
