const stageDetails = [
  { number: '01', title: 'Need recorded', detail: 'Buyer defines scope and criteria.', state: 'accepted' },
  { number: '02', title: 'Work accepted', detail: 'Buyer reviews evidence, accepts outcome.', state: 'proposed' },
  { number: '03', title: 'Payment released', detail: 'Payment releases on acceptance.', state: 'proposed' },
];

export function OperatingMap() {
  return (
    <figure className="landing-atlas-map" id="model" aria-label="Buyer path stages">
      <svg className="landing-atlas-thread" viewBox="0 0 900 48" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 24C106 4 192 44 300 24S496 4 600 24s194 20 296 0" stroke="var(--cloak-sisal)" stroke-width="5" fill="none" />
        <path d="M4 24C106 4 192 44 300 24S496 4 600 24s194 20 296 0" stroke="var(--cloak-forest)" stroke-width="1.5" stroke-dasharray="2 9" fill="none" />
      </svg>
      <ol className="landing-atlas-route" role="list" aria-label="Buyer path stages">
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
              </div>
              <p className="landing-atlas-step-detail">{stage.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="landing-atlas-note">
        Buyer reviews evidence and accepts before payment releases. Manual simulation only.
      </p>
    </figure>
  );
}
