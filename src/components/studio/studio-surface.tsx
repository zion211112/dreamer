'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BadgeCheck, Send } from 'lucide-react';

import { CapitalIntentDialog } from '@/components/capital-intent-dialog';
import { StudioRelations } from './studio-relations';
import { applyToOpportunity, publishOpportunity, reviewOpportunityApplication } from '../../../app/commons/opportunities/actions';
import { capitalStateLabel, resolveActions } from '@/lib/workbench/derive';
import { recordKey, recordTitle, type StudioRecord } from '@/lib/workbench/types';
import { formatMoney } from '@/lib/tender-data';
import type { StudioDataset } from '@/lib/workbench/dataset';
import type { StudioDerivation } from '@/lib/workbench/derive';

function dateLabel(value: string | null): string {
  if (!value) return 'Date unavailable';
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(timestamp);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="studio-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function IllustrativeMark() {
  return <span className="studio-illustrative">ILLUSTRATIVE · NOT LIVE WORK</span>;
}

export function StudioSurface({
  dataset,
  derivation,
  onFocus,
}: {
  dataset: StudioDataset;
  derivation: StudioDerivation;
  onFocus: (focus: string | null) => void;
}) {
  const [view, setView] = useState<'detail' | 'relations'>('detail');
  const record = derivation.focusedRecord;

  if (derivation.focus.kind === 'queue' && derivation.focusedQueue) {
    return <QueueSurface dataset={dataset} derivation={derivation} onFocus={onFocus} />;
  }

  if (!record) {
    return <ChooserSurface derivation={derivation} onFocus={onFocus} />;
  }

  return (
    <section className="studio-center" aria-label="Work surface">
      <div className="studio-surface-head">
        <p className="eyebrow">
          {record.kind === 'asset' && record.isIllustrative
            ? 'ASSET / SCENARIO'
            : `RECORD / ${record.kind.replace('_', ' ').toUpperCase()}`}
        </p>
        <h2>{recordTitle(record)}</h2>
        {derivation.focus.invalid && (
          <p className="studio-inline-error" role="alert">{derivation.focus.reason}</p>
        )}
        <div className="studio-surface-tabs" role="tablist" aria-label="Record view">
          <button
            aria-selected={view === 'detail'}
            className={view === 'detail' ? 'active' : ''}
            onClick={() => setView('detail')}
            role="tab"
            type="button"
          >
            Detail
          </button>
          <button
            aria-selected={view === 'relations'}
            className={view === 'relations' ? 'active' : ''}
            onClick={() => setView('relations')}
            role="tab"
            type="button"
          >
            Relations ({derivation.relations.links.length})
          </button>
        </div>
      </div>

      {view === 'detail' ? (
        <RecordDetail dataset={dataset} onFocus={onFocus} record={record} />
      ) : (
        <StudioRelations derivation={derivation} onFocus={onFocus} />
      )}
    </section>
  );
}

function ChooserSurface({
  derivation,
  onFocus,
}: {
  derivation: StudioDerivation;
  onFocus: (focus: string | null) => void;
}) {
  return (
    <section className="studio-center" aria-label="Work surface">
      <div className="studio-surface-head">
        <p className="eyebrow">START HERE</p>
        <h2>Choose where to start.</h2>
        <p className="studio-surface-note">{derivation.focus.reason}</p>
      </div>
      {derivation.chooser.length === 0 ? (
        <div className="studio-empty">
          <p className="eyebrow">NOTHING TO OPEN</p>
          <p>No record is visible to this account yet. The public Asset register and the Roll are open to read.</p>
          <Link className="button button-outline button-small" href="/tenders">Open the public register <ArrowRight aria-hidden="true" size={13} /></Link>
        </div>
      ) : (
        <ul className="studio-chooser">
          {derivation.chooser.map(entry => (
            <li key={entry.key}>
              <button onClick={() => onFocus(entry.key)} type="button">
                <span className="studio-chooser-kind">{entry.kind === 'queue' ? 'QUEUE' : 'RECORD'}</span>
                <strong>{entry.title}</strong>
                <small>{entry.subtitle}</small>
                <ArrowRight aria-hidden="true" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function QueueSurface({
  dataset,
  derivation,
  onFocus,
}: {
  dataset: StudioDataset;
  derivation: StudioDerivation;
  onFocus: (focus: string | null) => void;
}) {
  const queue = derivation.focusedQueue;
  if (!queue) return null;
  const records = queue.recordKeys
    .map(key => dataset.records.find(record => recordKey(record.kind, record.id) === key))
    .filter((record): record is StudioRecord => Boolean(record));

  return (
    <section className="studio-center" aria-label="Work surface">
      <div className="studio-surface-head">
        <p className="eyebrow">QUEUE / {queue.id.toUpperCase().replace(/-/g, ' ')}</p>
        <h2>{queue.title}</h2>
        <p className="studio-surface-note">{queue.hint}</p>
      </div>
      {records.length === 0 ? (
        <div className="studio-empty">
          <p className="eyebrow">{queue.emptyTitle.toUpperCase()}</p>
          <p>{queue.emptyReason}</p>
        </div>
      ) : (
        <ul className="studio-queue-records">
          {records.map(record => (
            <li key={recordKey(record.kind, record.id)}>
              <button onClick={() => onFocus(recordKey(record.kind, record.id))} type="button">
                <span className="studio-queue-kind">{record.kind.replace('_', ' ')}</span>
                <strong>{recordTitle(record)}</strong>
                <small>{recordSubtitleSafe(record)}</small>
                <ArrowRight aria-hidden="true" size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function recordSubtitleSafe(record: StudioRecord): string {
  switch (record.kind) {
    case 'asset':
      return `${record.issuer} · ${record.isIllustrative ? 'illustrative' : record.status.replace('_', ' ')}`;
    case 'role':
      return `${record.assetName ?? 'Asset'} · ${record.applicationCount} application${record.applicationCount === 1 ? '' : 's'}`;
    case 'application':
      return `${record.isOwn ? 'Your application' : record.applicantLabel} · ${record.status}`;
    case 'roll':
      return `Deployed ${dateLabel(record.deployedAt)}`;
    case 'capital_intent':
      return `${record.counterpartyLabel} · ${record.status}`;
    case 'capability_badge':
      return `${record.role} · issued ${dateLabel(record.issuedAt)}`;
  }
}

function RecordDetail({
  dataset,
  onFocus,
  record,
}: {
  dataset: StudioDataset;
  onFocus: (focus: string | null) => void;
  record: StudioRecord;
}) {
  return (
    <div className="studio-detail">
      {record.kind === 'asset' && <AssetDetail dataset={dataset} record={record} />}
      {record.kind === 'role' && <RoleDetail dataset={dataset} onFocus={onFocus} record={record} />}
      {record.kind === 'application' && <ApplicationDetail dataset={dataset} onFocus={onFocus} record={record} />}
      {record.kind === 'roll' && <RollDetail record={record} />}
      {record.kind === 'capital_intent' && <IntentDetail record={record} />}
      {record.kind === 'capability_badge' && <BadgeDetail dataset={dataset} onFocus={onFocus} record={record} />}
    </div>
  );
}

function AssetDetail({
  dataset,
  record,
}: {
  dataset: StudioDataset;
  record: Extract<StudioRecord, { kind: 'asset' }>;
}) {
  const actions = resolveActions(dataset, record);
  const signalAction = actions.find(action => action.id === 'signal-capital');
  const publishAction = actions.find(action => action.id === 'publish-role');
  const assemblyAction = actions.find(action => action.id === 'open-assembly');
  const dossierAction = actions.find(action => action.id === 'open-dossier');
  const rollAction = actions.find(action => action.id === 'open-roll');
  const [publishOpen, setPublishOpen] = useState(false);

  return (
    <>
      {record.isIllustrative && <IllustrativeMark />}
      <p className="studio-summary">{record.summary}</p>
      <div className="studio-metrics">
        <Metric label="BUILD COST" value={formatMoney(record.buildCostMinor, record.currency)} />
        <Metric label="FUNDING TARGET" value={record.fundingTargetMinor > 0 ? formatMoney(record.fundingTargetMinor, record.currency) : 'No target recorded'} />
        <Metric label="CAPITAL STATE" value={capitalStateLabel(record)} />
        <Metric label="SIGNALLED" value={formatMoney(record.signaledAmountMinor, record.currency)} />
        <Metric label="SETTLED" value={formatMoney(record.settledAmountMinor, record.currency)} />
        <Metric label="PROJECTED ANNUAL YIELD" value={record.projectedAnnualYieldMinor === null ? 'Not modeled' : formatMoney(record.projectedAnnualYieldMinor, record.currency)} />
      </div>
      <p className="studio-fine-print">
        The signalled total includes settled intents. A projection is a model, not realized revenue. Capital intent is non-binding and is not a payment, an escrow balance, or a yield right.
      </p>

      <section className="studio-block">
        <h3>Crew</h3>
        {record.crew.length === 0 ? (
          <p className="studio-fine-print">No crew is published for this Asset.</p>
        ) : (
          <ul className="studio-crew">
            {record.crew.map(member => (
              <li key={member.id}>
                <span className="studio-role">{member.role}</span>
                <strong>{member.displayName}</strong>
                <small>{member.organization || 'Organization not exposed'}</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="studio-block">
        <h3>Active Blueprint</h3>
        {record.blueprint ? (
          <>
            <p className="studio-fine-print">
              Version {record.blueprint.version} · <code>{record.blueprint.hash}</code>
            </p>
            <ul className="studio-bom">
              {record.blueprint.lines.map(line => (
                <li key={line.id}>
                  <span>{line.item}</span>
                  <small>{line.quantity} {line.unit}</small>
                  <strong>{formatMoney(line.unitCostMinor * line.quantity, record.currency)}</strong>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="studio-fine-print">No active Blueprint is readable for this Asset.</p>
        )}
      </section>

      <section className="studio-block">
        <h3>Actions</h3>
        <div className="studio-action-row">
          {dossierAction && dossierAction.available && dossierAction.href && (
            <Link className="button button-outline button-small" href={dossierAction.href}>
              {dossierAction.label} <ArrowUpRight aria-hidden="true" size={13} />
            </Link>
          )}
          {rollAction && rollAction.available && rollAction.href && (
            <Link className="button button-outline button-small" href={rollAction.href}>
              {rollAction.label} <ArrowUpRight aria-hidden="true" size={13} />
            </Link>
          )}
          {assemblyAction && (
            assemblyAction.available && assemblyAction.href ? (
              <Link className="button button-outline button-small" href={assemblyAction.href}>
                {assemblyAction.label} <ArrowUpRight aria-hidden="true" size={13} />
              </Link>
            ) : (
              <span className="studio-action-blocked" title={assemblyAction.blockedReason ?? undefined}>
                {assemblyAction.label}
              </span>
            )
          )}
          {signalAction && (
            signalAction.available ? (
              <CapitalIntentDialog
                acceptingSignals
                assetName={record.title}
                authenticated
                currency={record.currency}
                isIllustrative={record.isIllustrative}
                targetAmountMinor={record.fundingTargetMinor}
                tenderId={record.id}
              />
            ) : (
              <span className="studio-action-blocked" title={signalAction.blockedReason ?? undefined}>
                {signalAction.label}
              </span>
            )
          )}
          {publishAction && (
            publishAction.available ? (
              <button
                className="button button-outline button-small"
                onClick={() => setPublishOpen(value => !value)}
                type="button"
              >
                {publishAction.label} <ArrowRight aria-hidden="true" size={13} />
              </button>
            ) : (
              <span className="studio-action-blocked" title={publishAction.blockedReason ?? undefined}>
                {publishAction.label}
              </span>
            )
          )}
        </div>
        {publishAction?.blockedReason && (
          <p className="studio-blocked-reason">{publishAction.blockedReason}</p>
        )}
        {signalAction?.blockedReason && (
          <p className="studio-blocked-reason">{signalAction.blockedReason}</p>
        )}
        {assemblyAction?.blockedReason && (
          <p className="studio-blocked-reason">{assemblyAction.blockedReason}</p>
        )}
        {dossierAction?.blockedReason && (
          <p className="studio-blocked-reason">{dossierAction.blockedReason}</p>
        )}
        {publishOpen && publishAction?.available && (
          <PublishRoleForm tenderId={record.id} />
        )}
      </section>
    </>
  );
}

function PublishRoleForm({ tenderId }: { tenderId: string }) {
  const [roleTitle, setRoleTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    setError('');
    setMessage('');
    startTransition(async () => {
      const result = await publishOpportunity({ tenderId, roleTitle, description, skills });
      if (result.error) setError(result.error);
      else setMessage('Opportunity published to the Commons.');
    });
  }

  return (
    <div className="studio-form">
      <label>Role title
        <input maxLength={120} onChange={event => setRoleTitle(event.target.value)} value={roleTitle} />
      </label>
      <label>What needs doing?
        <textarea maxLength={3000} minLength={20} onChange={event => setDescription(event.target.value)} rows={3} value={description} />
      </label>
      <label>Skills, separated by commas
        <input maxLength={480} onChange={event => setSkills(event.target.value)} value={skills} />
      </label>
      {error && <p className="studio-inline-error" role="alert">{error}</p>}
      {message && <p className="studio-inline-success" role="status">{message}</p>}
      <button className="button button-primary button-small" disabled={pending} onClick={submit} type="button">
        {pending ? 'Publishing…' : 'Publish role'} <ArrowRight aria-hidden="true" size={13} />
      </button>
    </div>
  );
}

function RoleDetail({
  dataset,
  onFocus,
  record,
}: {
  dataset: StudioDataset;
  onFocus: (focus: string | null) => void;
  record: Extract<StudioRecord, { kind: 'role' }>;
}) {
  const actions = resolveActions(dataset, record);
  const applyAction = actions.find(action => action.id === 'apply');
  const ownApplication = dataset.records.find(
    (candidate): candidate is Extract<StudioRecord, { kind: 'application' }> =>
      candidate.kind === 'application' && candidate.roleId === record.id && candidate.isOwn,
  );
  const asset = dataset.records.find(
    candidate => candidate.kind === 'asset' && candidate.id === record.assetId,
  );

  return (
    <>
      <p className="studio-summary">{record.description}</p>
      <div className="studio-metrics">
        <Metric label="ASSET" value={record.assetName ?? 'Not resolved'} />
        <Metric label="APPLICATIONS" value={String(record.applicationCount)} />
        <Metric label="POSTED" value={dateLabel(record.createdAt)} />
      </div>
      {record.skillTags.length > 0 && (
        <div className="studio-tags">
          {record.skillTags.map(tag => <span key={tag}>{tag}</span>)}
        </div>
      )}
      <p className="studio-fine-print">
        Skill tags are free text written by the issuer. They are not a taxonomy and they are not matched against any capability record.
      </p>

      {asset && (
        <p className="studio-fine-print">
          <button className="studio-inline-link" onClick={() => onFocus(recordKey(asset.kind, asset.id))} type="button">
            Open the Asset record
          </button>
        </p>
      )}

      {ownApplication && (
        <section className="studio-block">
          <h3>Your application</h3>
          <p className="studio-fine-print">
            Submitted {dateLabel(ownApplication.createdAt)} · status {ownApplication.status}. Only you and the Asset’s authorized issuer can read it.
          </p>
          <button
            className="studio-inline-link"
            onClick={() => onFocus(recordKey(ownApplication.kind, ownApplication.id))}
            type="button"
          >
            Open your application
          </button>
        </section>
      )}

      <section className="studio-block">
        <h3>Apply</h3>
        {applyAction?.available ? (
          <ApplyForm opportunityId={record.id} />
        ) : (
          <>
            <p className="studio-blocked-reason">{applyAction?.blockedReason}</p>
            {applyAction?.disclosure && <p className="studio-fine-print">{applyAction.disclosure}</p>}
          </>
        )}
      </section>
    </>
  );
}

function ApplyForm({ opportunityId }: { opportunityId: string }) {
  const [note, setNote] = useState('');
  const [shareRollProfile, setShareRollProfile] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    setError('');
    setMessage('');
    startTransition(async () => {
      const result = await applyToOpportunity({ opportunityId, note, shareRollProfile });
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage('Application sent. The Asset issuer can review it alongside your Roll profile.');
      setNote('');
      setShareRollProfile(false);
    });
  }

  return (
    <div className="studio-form">
      <label>Short introduction
        <textarea maxLength={2000} minLength={20} onChange={event => setNote(event.target.value)} rows={3} value={note} />
      </label>
      <label className="studio-consent">
        <input checked={shareRollProfile} onChange={event => setShareRollProfile(event.target.checked)} type="checkbox" />
        <span>Share my Roll profile, earned badges and display name with this Asset’s authorized issuer for this application. This does not make my profile public.</span>
      </label>
      <p className="studio-fine-print">No previous badge is required. Your application is private to you and the authorized issuer.</p>
      {error && <p className="studio-inline-error" role="alert">{error}</p>}
      {message && <p className="studio-inline-success" role="status">{message}</p>}
      <button className="button button-primary button-small" disabled={pending || !shareRollProfile} onClick={submit} type="button">
        <Send aria-hidden="true" size={13} /> {pending ? 'Sending…' : 'Send application'}
      </button>
    </div>
  );
}

function ApplicationDetail({
  dataset,
  onFocus,
  record,
}: {
  dataset: StudioDataset;
  onFocus: (focus: string | null) => void;
  record: Extract<StudioRecord, { kind: 'application' }>;
}) {
  const actions = resolveActions(dataset, record);
  const review = actions.filter(action => action.serverAction === 'review');
  const role = dataset.records.find(candidate => candidate.kind === 'role' && candidate.id === record.roleId);

  return (
    <>
      <div className="studio-applicant">
        <strong>{record.applicantLabel}</strong>
        <small>
          {record.applicantIdentityExposed
            ? 'The applicant consented to share their public Roll profile with this issuer.'
            : 'The applicant shared their note privately. Their display name is not exposed.'}
        </small>
      </div>
      <p className="studio-note-body">{record.note}</p>
      <div className="studio-metrics">
        <Metric label="STATUS" value={record.status} />
        <Metric label="SUBMITTED" value={dateLabel(record.createdAt)} />
        <Metric label="VERIFIED DEPLOYMENTS" value={String(record.deployedAssetCount)} />
        <Metric label="CAPABILITY PROOFS" value={String(record.capabilityBadgeCount)} />
        <Metric label="DEPLOYMENT TIER" value={record.deploymentTier ?? 'Not derived'} />
      </div>
      <p className="studio-fine-print">
        The deployment tier counts verified deployments. It is not a skill score and it is not a rating.
      </p>

      <section className="studio-block">
        <h3>Shared proof</h3>
        {record.sharedBadges.length === 0 ? (
          <p className="studio-fine-print">No deployed Capability Badge was shared with this issuer. First-build applicants are welcome.</p>
        ) : (
          <ul className="studio-badge-list">
            {record.sharedBadges.map((badge, index) => (
              <li key={`${record.id}-${index}`}>
                <BadgeCheck aria-hidden="true" size={14} />
                <span>{badge.assetName} · {badge.role} · <code>{badge.blueprintHash.slice(0, 12)}…</code></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="studio-block">
        <h3>Review</h3>
        {review.every(action => !action.available) ? (
          <p className="studio-blocked-reason">{review[0]?.blockedReason}</p>
        ) : (
          <ReviewActions applicationId={record.id} reviewActions={review} />
        )}
        {role && (
          <p className="studio-fine-print">
            <button className="studio-inline-link" onClick={() => onFocus(recordKey(role.kind, role.id))} type="button">
              Open the role record
            </button>
          </p>
        )}
      </section>
    </>
  );
}

function ReviewActions({
  applicationId,
  reviewActions,
}: {
  applicationId: string;
  reviewActions: ReturnType<typeof resolveActions>;
}) {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function review(status: 'reviewed' | 'declined') {
    setError('');
    setMessage('');
    startTransition(async () => {
      const result = await reviewOpportunityApplication({ applicationId, status });
      if (result.error) setError(result.error);
      else setMessage(status === 'reviewed' ? 'Application marked for follow-up.' : 'Application declined.');
    });
  }

  return (
    <>
      <div className="studio-action-row">
        {reviewActions.map(action => (
          <button
            className="button button-outline button-small"
            disabled={pending}
            key={action.id}
            onClick={() => review(action.payload.status === 'declined' ? 'declined' : 'reviewed')}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
      {error && <p className="studio-inline-error" role="alert">{error}</p>}
      {message && <p className="studio-inline-success" role="status">{message}</p>}
    </>
  );
}

function RollDetail({ record }: { record: Extract<StudioRecord, { kind: 'roll' }> }) {
  return (
    <>
      <p className="studio-summary">
        A Roll record is written after an assigned Anchor signs off the active Blueprint and the build is deployed. It carries no cash-flow right and no cooperative vote.
      </p>
      <div className="studio-metrics">
        <Metric label="DEPLOYED" value={dateLabel(record.deployedAt)} />
        <Metric label="BLUEPRINT" value={record.blueprintId} />
        <Metric label="BUILD COST" value={formatMoney(record.buildCostMinor, record.currency)} />
      </div>
      <section className="studio-block">
        <h3>Anchor sign-off</h3>
        <p className="studio-fine-print">
          Crew member <code>{record.anchorCrewMemberId}</code> signed at {dateLabel(record.anchorSignedAt)} against Blueprint <code>{record.blueprintHash}</code>.
        </p>
      </section>
      <section className="studio-block">
        <h3>Crew snapshot</h3>
        <ul className="studio-crew">
          {record.crew.map(member => (
            <li key={member.id}>
              <span className="studio-role">{member.role}</span>
              <strong>{member.displayName}</strong>
              <small>{member.organization || 'Organization not exposed'}</small>
            </li>
          ))}
        </ul>
      </section>
      <section className="studio-block">
        <h3>Blueprint lines</h3>
        <ul className="studio-bom">
          {record.blueprintLines.map(line => (
            <li key={line.id}>
              <span>{line.item}</span>
              <small>{line.quantity} {line.unit}</small>
              <strong>{formatMoney(line.unitCostMinor * line.quantity, record.currency)}</strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function IntentDetail({ record }: { record: Extract<StudioRecord, { kind: 'capital_intent' }> }) {
  return (
    <>
      <p className="studio-summary">
        {record.relation === 'own'
          ? 'Your non-binding intent to fund. It is not a payment, an escrow balance, or a promise of yield.'
          : 'Another participant’s intent on an Asset you issue. Their identity is not exposed to the application.'}
      </p>
      <div className="studio-metrics">
        <Metric label="AMOUNT" value={formatMoney(record.amountMinor, record.currency)} />
        <Metric label="STATUS" value={record.status} />
        <Metric label="RECORDED" value={dateLabel(record.createdAt)} />
        <Metric label="RELATION" value={record.relation === 'own' ? 'Your intent' : 'Issuer view'} />
      </div>
      <p className="studio-fine-print">
        An authorized issuer verifies offline settlement. The Studio has no settlement-verification flow, and the signalled total on an Asset includes settled intents.
      </p>
    </>
  );
}

function BadgeDetail({
  dataset,
  onFocus,
  record,
}: {
  dataset: StudioDataset;
  onFocus: (focus: string | null) => void;
  record: Extract<StudioRecord, { kind: 'capability_badge' }>;
}) {
  const asset = dataset.records.find(candidate => candidate.kind === 'asset' && candidate.id === record.tenderId);
  return (
    <>
      <p className="studio-summary">
        A capability proof records a verified deployment. It is not a skill score, it is not transferable, and it carries no yield right.
      </p>
      <div className="studio-metrics">
        <Metric label="ROLE" value={record.role} />
        <Metric label="ISSUED" value={dateLabel(record.issuedAt)} />
        <Metric label="VERIFIED DEPLOYMENTS" value={String(record.deploymentCount)} />
        <Metric label="BLUEPRINT" value={record.blueprintHash ?? 'Not exposed'} />
      </div>
      <p className="studio-fine-print">
        Verified by the Anchor sign-off on the Roll record: crew member <code>{record.verifiedByCrewMemberId ?? 'not exposed'}</code> at {dateLabel(record.verifiedAt)}.
      </p>
      {!dataset.principal.publicNameConsent && (
        <p className="studio-fine-print">
          Your public Roll profile is not shared, so the public register shows no entry for you. Your own proofs remain readable to you here.
        </p>
      )}
      {asset && (
        <p className="studio-fine-print">
          <button className="studio-inline-link" onClick={() => onFocus(recordKey(asset.kind, asset.id))} type="button">
            Open the Asset record
          </button>
        </p>
      )}
    </>
  );
}


