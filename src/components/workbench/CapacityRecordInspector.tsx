import { useEffect, useRef, useState } from 'preact/hooks';
import { KIRINYAGA_CAPACITY_SCENARIO, type CapacityCandidate } from '../../lib/workbench-capacity';

export interface CapacityRecordInspectorProps {
  candidate: CapacityCandidate | null;
  shortlisted: boolean;
  onToggleShortlist(): void;
  onClose(): void;
}

function availabilityLabel(availability: CapacityCandidate['availability']): string {
  if (availability === 'available') return 'Stated available';
  if (availability === 'unavailable') return 'Stated unavailable';
  return 'Not reported';
}

export function CapacityRecordInspector({
  candidate,
  shortlisted,
  onToggleShortlist,
  onClose,
}: CapacityRecordInspectorProps) {
  const [isNarrow, setIsNarrow] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shortlistButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setIsNarrow(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (candidate && isNarrow) closeButtonRef.current?.focus();
  }, [candidate?.id, isNarrow]);

  function handleKeyDown(event: KeyboardEvent) {
    if (!candidate || !isNarrow) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;

    const first = closeButtonRef.current;
    const last = shortlistButtonRef.current;
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <aside
      aria-label={candidate ? `${candidate.name} capacity details` : 'Candidate details'}
      aria-modal={candidate && isNarrow ? 'true' : undefined}
      className={`capacity-inspector${candidate ? ' is-open' : ''}`}
      onKeyDown={handleKeyDown}
      role={candidate && isNarrow ? 'dialog' : undefined}
    >
      {candidate ? (
        <>
          <header className="capacity-inspector-heading">
            <div>
              <p className="capacity-kicker">RECORD INSPECTOR / ILLUSTRATIVE</p>
              <h2 id="capacity-inspector-title">{candidate.name}</h2>
            </div>
            <button
              aria-label="Close candidate details"
              className="capacity-inspector-close"
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >×</button>
          </header>
          <p className="capacity-inspector-location">{candidate.entityType} · {candidate.location}</p>
          <div className="capacity-inspector-measures">
            <div>
              <span>Reported capacity</span>
              <strong>{candidate.reportedCapacity} {candidate.capacityUnit}/{candidate.capacityPeriod}</strong>
            </div>
            <div>
              <span>Scenario distance</span>
              <strong>{candidate.distanceKm} km</strong>
            </div>
            <div>
              <span>Availability</span>
              <strong>{availabilityLabel(candidate.availability)}</strong>
            </div>
          </div>
          <section className="capacity-inspector-section">
            <h3>Capability signals for this need</h3>
            <p className="capacity-inspector-need">{KIRINYAGA_CAPACITY_SCENARIO.need.title}</p>
            <ul className="capacity-capability-list">
              {candidate.capabilities.map(capability => <li key={capability}>{capability}</li>)}
            </ul>
          </section>
          <section className="capacity-inspector-section">
            <h3>Evidence and open checks</h3>
            {candidate.evidence.length > 0 ? (
              <ul className="capacity-evidence-list">
                {candidate.evidence.map(evidence => (
                  <li key={evidence.id}>
                    <strong>{evidence.source}</strong>
                    <span>{evidence.date} · illustrative</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="capacity-inspector-gap">No evidence attached. Capacity and availability still need confirmation.</p>
            )}
            {candidate.evidence.length > 0 && (
              <p className="capacity-inspector-gap">Availability has not been reported; confirm before making a plan.</p>
            )}
          </section>
          <p className="capacity-inspector-boundary">
            Scenario values are synthetic, not verified or live. A shortlist is not an offer or authorization.
          </p>
          <button
            aria-pressed={shortlisted}
            className="capacity-inspector-shortlist"
            onClick={onToggleShortlist}
            ref={shortlistButtonRef}
            type="button"
          >
            {shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
          </button>
        </>
      ) : (
        <div className="capacity-inspector-empty">
          <p className="capacity-kicker">INSPECT A CANDIDATE</p>
          <h2>Choose a capacity record.</h2>
          <p>Compare its listed skills, reported capacity, distance, and evidence before shortlisting.</p>
        </div>
      )}
    </aside>
  );
}
