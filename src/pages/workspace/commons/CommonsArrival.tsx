import { useState } from 'preact/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Provenance = 'verified' | 'firsthand' | 'community' | 'expert' | 'proposal';

const PROVENANCE: Record<Provenance, { label: string; color: string }> = {
  verified:   { label: 'Verified',    color: 'var(--state-canon)' },
  firsthand:  { label: 'First-hand',  color: 'var(--sage)' },
  community:  { label: 'Community',   color: 'var(--lilac)' },
  expert:     { label: 'Expert',      color: 'var(--forest)' },
  proposal:   { label: 'Proposal',    color: 'var(--peach)' },
};

interface PathLink {
  id: string;
  label: string;
}

const PATHS: PathLink[] = [
  { id: 'discover',  label: 'Discover' },
  { id: 'guides',    label: 'Find guides' },
  { id: 'community', label: 'Explore contributions' },
  { id: 'share',     label: 'Share' },
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
        <h1 className="commons-arrival-title">
          What are you trying to make possible?
        </h1>
        <p className="commons-arrival-sub">
          The commons holds observations, offers, resources, and decisions.
          Search it, or pick a path.
        </p>
      </header>

      <form className="commons-arrival-invitation" onSubmit={handleExplore} noValidate>
        <div className="commons-arrival-input-group">
          <Input
            id="commons-intention"
            type="text"
            value={query}
            onInput={(event) => setQuery((event.target as HTMLInputElement).value)}
            placeholder="e.g. How do small cooperatives organise produce collection?"
            className="commons-arrival-input"
          />
          <Button variant="primary" size="lg" type="submit">
            Explore
          </Button>
        </div>
      </form>

      <nav className="commons-arrival-paths" aria-label="Commons paths">
        {PATHS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="commons-arrival-path-link"
            onClick={() => onOpenPath(p.id)}
          >
            {p.label}
            <span className="commons-arrival-path-arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </nav>

      <div className="commons-arrival-provenance" aria-label="Provenance types">
        {(Object.keys(PROVENANCE) as Provenance[]).map((key) => (
          <span
            key={key}
            className="commons-arrival-prov"
            style={{ color: PROVENANCE[key].color }}
          >
            <span className="commons-arrival-prov-dot" style={{ background: PROVENANCE[key].color }} />
            {PROVENANCE[key].label}
          </span>
        ))}
      </div>
    </section>
  );
}
