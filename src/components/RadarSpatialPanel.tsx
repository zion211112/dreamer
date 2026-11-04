import type { FieldSignal } from '../lib/local-workflows';
import { getRadarSignalSummary, getRadarSpatialState } from '../lib/radar-view';

interface RadarSpatialPanelProps {
  signals: readonly FieldSignal[];
}

const signalStages = [
  { label: 'New', key: 'new' },
  { label: 'Being checked', key: 'triaged' },
  { label: 'Work planning', key: 'brief' },
  { label: 'Closed', key: 'resolved' },
] as const;

export function RadarSpatialPanel({ signals }: RadarSpatialPanelProps) {
  const summary = getRadarSignalSummary(signals);
  const spatialState = getRadarSpatialState(signals);
  const illustrativeCount = signals.filter(signal => signal.scenario || signal.recordBasis === 'illustrative').length;

  return (
    <section className="radar-spatial-panel" aria-labelledby="radar-spatial-title">
      <header className="radar-spatial-head">
        <div>
          <p className="eyebrow">SPATIAL VIEW / LOCAL DATA</p>
          <h2 id="radar-spatial-title">Place, without false precision</h2>
          <p>Location notes stay attached to their records. This view does not turn text into map coordinates.</p>
        </div>
        <div className="radar-map-status" aria-label="Map provider status">
          <span aria-hidden="true" />
          <div>
            <small>MAP LAYER</small>
            <strong>Not connected</strong>
          </div>
        </div>
      </header>

      <div className={`radar-spatial-stage radar-spatial-stage--${spatialState}`}>
        <div className="radar-spatial-grid" aria-hidden="true" />
        <span className="radar-spatial-code" aria-hidden="true">NO COORDINATES / NO TILES</span>
        <div className="radar-spatial-empty" role="status" aria-live="polite">
          <span className="radar-spatial-glyph" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M5 8.5 12 5l8 3.5L27 5v18.5L20 27l-8-3.5L5 27V8.5Z" />
              <path d="M12 5v18.5M20 8.5V27" />
              <path d="M16 12.5v7m-3.5-3.5h7" />
            </svg>
          </span>
          <p className="eyebrow">{spatialState === 'empty-scope' ? 'EMPTY SCOPE' : 'LOCATION DATA UNAVAILABLE'}</p>
          <h3>{spatialState === 'empty-scope' ? 'No signals in this view' : 'No approximate locations recorded'}</h3>
          <p>
            {spatialState === 'empty-scope'
              ? 'Try another institution or remove a filter. This browser has no matching records.'
              : 'No spatial points are shown. A map provider and privacy-reviewed approximate locations have not been configured.'}
          </p>
        </div>
        <span className="radar-spatial-edge-note" aria-hidden="true">NO LOCATION INFERENCE / CURRENT MODE</span>
      </div>

      <div className="radar-spatial-data">
        <div className="radar-spatial-total">
          <span className="eyebrow">VISIBLE IN THIS VIEW</span>
          <strong>{summary.total.toLocaleString('en')}</strong>
          <small>Browser-local records</small>
        </div>
        <dl className="radar-spatial-stages" aria-label="Signal status counts">
          {signalStages.map(stage => (
            <div key={stage.key}>
              <dt>{stage.label}</dt>
              <dd>{summary[stage.key].toLocaleString('en')}</dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="radar-spatial-disclaimer">
        Browser-local demo · institution scope is a view, not access control; these are not shared-register counts.
        {illustrativeCount > 0 && ` Includes ${illustrativeCount} illustrative ${illustrativeCount === 1 ? 'prompt' : 'prompts'}.`}
      </p>
    </section>
  );
}
