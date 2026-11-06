import { Link } from 'wouter';
import type { NetworkEntity } from '../../../lib/people-network';

interface InstitutionInspectorProps {
  selectedRecord: {
    entity: NetworkEntity;
    recordType: 'Institution' | 'Asset';
    location: string;
    relationships: string[];
  };
  recordIndex: number;
  signalCounts: Record<string, number>;
  basisLabel: (basis: NetworkEntity['recordBasis']) => string;
}

export function InstitutionInspector({
  selectedRecord,
  recordIndex,
  signalCounts,
  basisLabel,
}: InstitutionInspectorProps) {
  const { entity, recordType, relationships } = selectedRecord;

  return (
    <aside aria-labelledby="institution-inspector-title" className="institution-inspector">
      <div className="institution-inspector-topline">
        <span>Record {String(recordIndex).padStart(2, '0')}</span>
        <span>{recordType}</span>
      </div>
      <div className={`institution-inspector-symbol institution-inspector-symbol--${recordType.toLowerCase()}`} aria-hidden="true">
        <span />
      </div>
      <p className="institution-inspector-role">{entity.role}</p>
      <h2 id="institution-inspector-title">{entity.name}</h2>
      <p className="institution-inspector-summary">{entity.summary}</p>

      <dl className="institution-facts">
        <div>
          <dt>Record basis</dt>
          <dd>{basisLabel(entity.recordBasis)}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{selectedRecord.location}</dd>
        </div>
        {recordType === 'Asset' && (
          <>
            <div><dt>Condition</dt><dd>Not recorded</dd></div>
            <div><dt>Availability</dt><dd>Not established</dd></div>
          </>
        )}
      </dl>

      {entity.context && <p className="institution-record-context">{entity.context}</p>}

      <section aria-labelledby="institution-relationships-title" className="institution-relationships">
        <h3 id="institution-relationships-title">
          Recorded links <span>{String(relationships.length).padStart(2, '0')}</span>
        </h3>
        {relationships.length > 0 ? (
          <ul>
            {relationships.map((relationship, index) => (
              <li key={`${entity.id}-${index}`}>{relationship}</li>
            ))}
          </ul>
        ) : (
          <p>No explicit relationships are recorded for this entry.</p>
        )}
      </section>

      {recordType === 'Institution' && (
        <Link className="institution-context-link" href={`/workspace/commons?institution=${encodeURIComponent(entity.id)}`}>
          <span>
            <small>COMMONS CONTEXT</small>
            <strong>{signalCounts[entity.id] ?? 0} local signals</strong>
          </span>
          <span aria-hidden="true">↗</span>
        </Link>
      )}
      {entity.id === 'asset-school-management-console' && (
        <Link className="institution-context-link" href="/workspace/institutions/school-console">
          <span>
            <small>LOCAL-FIRST PROTOTYPE</small>
            <strong>Open School Console</strong>
          </span>
          <span aria-hidden="true">↗</span>
        </Link>
      )}
    </aside>
  );
}
