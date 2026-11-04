import type { FieldSignal } from '../lib/local-workflows';
import { getMockRadarMapScene } from '../lib/mock-radar-map-provider';
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
  const mockMapScene = getMockRadarMapScene();

  return (
    <section className="radar-spatial-panel" aria-labelledby="radar-spatial-title">
      <header className="radar-spatial-head">
        <div>
          <p className="eyebrow">SPATIAL VIEW / MOCK PROVIDER</p>
          <h2 id="radar-spatial-title">A map-shaped simulation</h2>
          <p>This schematic is generated locally. It is not a real place and does not position signal records.</p>
        </div>
        <div className="radar-map-status" aria-label="Map provider status: local mock, offline">
          <span aria-hidden="true" />
          <div>
            <small>PROVIDER</small>
            <strong>Mock · offline</strong>
          </div>
        </div>
      </header>

      <div className={`radar-spatial-stage radar-spatial-stage--${spatialState}`}>
        <svg
          aria-labelledby="radar-mock-map-title radar-mock-map-description"
          className="radar-mock-map"
          role="img"
          viewBox="0 0 1000 480"
          preserveAspectRatio="xMidYMid slice"
        >
          <title id="radar-mock-map-title">Synthetic map preview</title>
          <desc id="radar-mock-map-description">
            A fictional schematic with five sample markers. It is not a real location and none of the markers represent signal records.
          </desc>
          <defs>
            <pattern id="radar-mock-map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M48 0H0V48" fill="none" className="radar-mock-map-grid-line" />
            </pattern>
            <pattern id="radar-mock-map-blocks" width="180" height="134" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
              <rect x="14" y="12" width="56" height="34" rx="3" className="radar-mock-map-block" />
              <rect x="82" y="12" width="78" height="34" rx="3" className="radar-mock-map-block" />
              <rect x="14" y="58" width="82" height="60" rx="3" className="radar-mock-map-block" />
              <rect x="108" y="58" width="52" height="60" rx="3" className="radar-mock-map-block" />
            </pattern>
          </defs>
          <rect width="1000" height="480" className="radar-mock-map-ground" />
          <rect width="1000" height="480" fill="url(#radar-mock-map-grid)" />
          <rect x="34" y="28" width="932" height="424" fill="url(#radar-mock-map-blocks)" />
          <path
            d="M-20 354C126 296 183 378 318 320S511 213 632 266s205 122 389 35"
            className="radar-mock-map-route radar-mock-map-route--primary"
          />
          <path
            d="M126-24c22 123 126 116 156 203s-12 145 82 195 179 36 198 126M712-18c-44 98-30 169 39 218s147 56 156 171"
            className="radar-mock-map-route"
          />
          <path d="M67 93H933M67 187H933M67 281H933M67 375H933" className="radar-mock-map-road" />
          <path d="M198 50V430M397 50V430M596 50V430M795 50V430" className="radar-mock-map-road" />
          <g aria-hidden="true">
            {mockMapScene.points.map(point => (
              <g
                className="radar-mock-map-point"
                key={point.id}
                transform={`translate(${point.x * 10} ${point.y * 4.8})`}
              >
                <circle className="radar-mock-map-point-halo" r="20" />
                <circle className="radar-mock-map-point-core" r="5" />
              </g>
            ))}
          </g>
        </svg>
        <span className="radar-spatial-code">FICTIONAL SCHEMATIC / NOT TO SCALE</span>
        <p className="radar-spatial-disclosure" role="status" aria-live="polite">
          <strong>SIMULATION ONLY</strong>
          {spatialState === 'empty-scope'
            ? ' No records match this view. Sample markers are unrelated to signals.'
            : ' Sample markers are not real places or signal locations.'}
        </p>
        <span className="radar-spatial-edge-note" aria-hidden="true">NO TILES / NO GEOCODING / NO RECORD PINS</span>
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
