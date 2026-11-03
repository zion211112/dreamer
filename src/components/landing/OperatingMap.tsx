const stageDetails = [
  { number: '01', title: 'Need recorded', detail: 'Asset, inspection, or draft', state: 'built', stateLabel: 'Prototype surface' },
  { number: '02', title: 'Scope approved', detail: 'Buyer sets budget & criteria', state: 'built', stateLabel: 'Prototype surface' },
  { number: '03', title: 'Team assembled', detail: 'Qualified local delivery', state: 'proposed', stateLabel: 'Proposed live model' },
  { number: '04', title: 'Work accepted', detail: 'Buyer reviews evidence', state: 'proposed', stateLabel: 'Proposed live model' },
  { number: '05', title: 'Outcome recorded', detail: 'Consent and issuer required', state: 'proposed', stateLabel: 'Proposed live model' },
];

export function OperatingMap() {
  return (
    <figure className="landing-atlas-map" id="model" aria-labelledby="atlas-map-title">
      <figcaption className="landing-atlas-map-heading">
        <strong id="atlas-map-title">Proposed operating sequence</strong>
        <span>Human authorization retained at every gate</span>
      </figcaption>

      <ol className="landing-atlas-route" role="list" aria-label="Five proposed work stages">
        {stageDetails.map((stage, index) => (
          <li key={stage.number} className="landing-atlas-stop">
            <div className="landing-atlas-connector" aria-hidden="true">
              {index < stageDetails.length - 1 && <span className="landing-atlas-line" />}
              <span
                className={`landing-atlas-marker ${stage.state}`}
                data-state={stage.state}
              />
            </div>
            <div className="landing-atlas-content">
              <div className="landing-atlas-step-head">
                <span className="landing-atlas-step-number">{stage.number}</span>
                <h4 className="landing-atlas-step-title">{stage.title}</h4>
                <span className={`landing-atlas-state-badge ${stage.state}`}>
                  {stage.state === 'built' ? 'In prototype' : 'Proposed'}
                </span>
              </div>
              <p className="landing-atlas-step-detail">{stage.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="landing-atlas-legend" aria-label="Legend: prototype vs proposed">
        <span className="landing-atlas-legend-item">
          <span className="landing-atlas-legend-dot built" aria-hidden="true" />
          In the browser prototype
        </span>
        <span className="landing-atlas-legend-item">
          <span className="landing-atlas-legend-dot proposed" aria-hidden="true" />
          Proposed live model
        </span>
      </div>

      <p className="landing-atlas-note">
        Manual simulation only. No real-world transactions, provider assignment, or payment.
      </p>
    </figure>
  );
}