'use client';

import { BadgeCheck, CircleAlert, ShieldCheck } from 'lucide-react';

import { capitalStateLabel } from '@/lib/workbench/derive';
import { recordTitle } from '@/lib/workbench/types';
import type { StudioDataset } from '@/lib/workbench/dataset';
import type { StudioDerivation } from '@/lib/workbench/derive';
import type { StudioAction, StudioRecord } from '@/lib/workbench/types';

const stateSource: Record<StudioRecord['kind'], string> = {
  asset:
    'tenders.status, kept in step with the capital ledger by refresh_tender_signal_total. Capital is read from current_signaled_amount_minor and current_settled_amount_minor; the signalled total includes settled intents.',
  role:
    'commons_opportunities, read through the public open-roles view. The public view exposes open roles only, so a closed role is not reachable from here.',
  application:
    'commons_applications.status, read through get_commons_opportunity_applications. The server returns only the applications this account is entitled to see.',
  roll:
    'roll_records, written when the assigned Anchor signed the active Blueprint and the build was deployed. The Anchor sign-off is the verifier.',
  capital_intent:
    'capital_intents.status. An intent is a signal: it is not a payment, an escrow balance, or a settlement.',
  capability_badge:
    'roll_capability_badges, issued against a Roll record. The verifier is the Anchor sign-off carried by that Roll record, not a self-declared score.',
};

function missingFor(record: StudioRecord): string[] {
  const missing: string[] = [];
  if (record.kind === 'asset') {
    if (!record.blueprint) missing.push('The active Blueprint is not readable for this Asset.');
    if (!record.crew.length) missing.push('No crew is published for this Asset.');
    if (record.fundingTargetMinor <= 0) missing.push('No capital target is recorded. Unfunded here does not mean capital is not needed.');
    if (!record.hasDossier) missing.push('A deployed Asset has no dossier route. The Roll is its destination.');
    if (record.projectedAnnualYieldMinor === null) missing.push('No annual yield is modeled for this Asset.');
  }
  if (record.kind === 'role') {
    if (!record.skillTags.length) missing.push('The issuer wrote no skill tags, so there is nothing to match a capability record against.');
    if (record.applicationCount === 0) missing.push('No application has been sent to this role yet.');
    if (!record.assetId) missing.push('The Asset behind this role is not visible to this account.');
  }
  if (record.kind === 'application') {
    if (!record.sharedBadges.length) missing.push('No deployed capability proof was shared with this issuer.');
    if (!record.applicantIdentityExposed) missing.push('The applicant’s display name is not exposed. Only their note and shared proof are.');
  }
  if (record.kind === 'roll') {
    if (!record.blueprintLines.length) missing.push('The Roll snapshot carries no blueprint lines.');
  }
  if (record.kind === 'capital_intent') {
    if (record.status === 'SIGNALED') missing.push('Settlement has not been verified. No application-level verification flow exists.');
    if (record.relation === 'issuer') missing.push('The participant behind this intent is not identified to the application.');
  }
  if (record.kind === 'capability_badge') {
    if (!record.verifiedByCrewMemberId) missing.push('The Anchor sign-off behind this proof is not readable.');
    if (record.deploymentCount === 0) missing.push('No verified deployment is counted for this member.');
  }
  return missing;
}

function evidenceFor(record: StudioRecord): string[] {
  if (record.kind === 'asset') {
    const evidence = [
      `Blueprint ${record.blueprint ? `v${record.blueprint.version} · ${record.blueprint.hash}` : 'not readable'}`,
    ];
    if (record.crew.length) evidence.push(`${record.crew.length} crew members published`);
    if (record.anchorSignOff) evidence.push('Anchor sign-off recorded on this Asset');
    return evidence;
  }
  if (record.kind === 'role') {
    return [
      `${record.applicationCount} application${record.applicationCount === 1 ? '' : 's'}`,
      record.skillTags.length ? `${record.skillTags.length} issuer-written skill tags` : 'No skill tags',
    ];
  }
  if (record.kind === 'application') {
    return [
      `${record.deployedAssetCount} verified deployment${record.deployedAssetCount === 1 ? '' : 's'}`,
      `${record.capabilityBadgeCount} capability proof${record.capabilityBadgeCount === 1 ? '' : 's'}`,
      record.deploymentTier ? `Deployment tier ${record.deploymentTier}` : 'No deployment tier derived',
    ];
  }
  if (record.kind === 'roll') {
    return [
      `Anchor crew member ${record.anchorCrewMemberId}`,
      `Blueprint ${record.blueprintHash}`,
      `${record.crew.length} crew in the snapshot`,
    ];
  }
  if (record.kind === 'capital_intent') {
    return [record.status === 'SETTLED_OFFLINE' ? 'Settlement verified by an authorized issuer' : 'No settlement verification recorded'];
  }
  return [
    `Verified deployments: ${record.deploymentCount}`,
    record.blueprintHash ? `Blueprint ${record.blueprintHash}` : 'Blueprint hash not readable',
    record.verifiedByCrewMemberId ? `Anchor sign-off by ${record.verifiedByCrewMemberId}` : 'Anchor sign-off not readable',
  ];
}

export function StudioInspector({
  dataset,
  derivation,
  onFocus,
}: {
  dataset: StudioDataset;
  derivation: StudioDerivation;
  onFocus: (focus: string | null) => void;
}) {
  const record = derivation.focusedRecord;

  return (
    <aside className="studio-right" aria-label="Context inspector">
      <div className="studio-inspector-head">
        <p className="eyebrow">CONTEXT INSPECTOR</p>
        <h2>{record ? recordTitle(record) : 'Nothing focused'}</h2>
        {record && <p className="studio-inspector-kind">{record.kind.replace('_', ' ')}</p>}
      </div>

      {record ? (
        <>
          <section className="studio-inspector-block">
            <h3>What this is</h3>
            <p>
              {record.kind === 'asset'
                ? 'An Asset is the primary domain entity: a build with a capital target, a Blueprint, a crew and a lifecycle state.'
                : record.kind === 'role'
                  ? 'An open role attached to one Asset. Applications are private to the applicant and the Asset’s authorized issuer.'
                  : record.kind === 'application'
                    ? 'An application to an open role. It carries a note and, only with consent, part of the applicant’s Roll profile.'
                    : record.kind === 'roll'
                      ? 'A proof record written after a deployed, Anchor-signed build. It carries no cash-flow right.'
                      : record.kind === 'capital_intent'
                        ? 'A non-binding signal that the participant intends to fund an Asset.'
                        : 'A capability proof: a verified deployment, not a skill score.'}
            </p>
          </section>

          <section className="studio-inspector-block">
            <h3>Where its state came from</h3>
            <p className="studio-inspector-basis">{stateSource[record.kind]}</p>
            {record.kind === 'asset' && (
              <p className="studio-inspector-basis">
                Capital state: {capitalStateLabel(record)}.
              </p>
            )}
          </section>

          <section className="studio-inspector-block">
            <h3>Evidence</h3>
            <ul className="studio-evidence-list">
              {evidenceFor(record).map(item => (
                <li key={item}><BadgeCheck aria-hidden="true" size={13} />{item}</li>
              ))}
            </ul>
          </section>

          <section className="studio-inspector-block">
            <h3>What you may do</h3>
            <ActionList actions={derivation.actions} onFocus={onFocus} />
          </section>

          <section className="studio-inspector-block">
            <h3>What is missing</h3>
            {missingFor(record).length === 0 ? (
              <p className="studio-inspector-basis">Nothing the server would have returned is absent from this record.</p>
            ) : (
              <ul className="studio-missing-list">
                {missingFor(record).map(item => (
                  <li key={item}><CircleAlert aria-hidden="true" size={13} />{item}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="studio-inspector-block studio-inspector-next">
            <h3>Next step</h3>
            <p>{derivation.nextStep ?? 'Choose a record to see the next authorised step.'}</p>
          </section>
        </>
      ) : (
        <section className="studio-inspector-block">
          <h3>Nothing focused</h3>
          <p>{derivation.focus.reason}</p>
          {dataset.principal.localMode && (
            <p className="studio-inspector-basis">
              This Studio is running on a local development identity. Every shared write is blocked with a reason; nothing is a dead button.
            </p>
          )}
        </section>
      )}

      <section className="studio-inspector-block">
        <h3>Limits of this interface</h3>
        <ul className="studio-limit-list">
          <li>Closed roles are not exposed by the public view, so they cannot be opened here.</li>
          <li>Funder identities are not exposed, so capital is shown as totals and your own intent only.</li>
          <li>Settlement verification exists as a database function but has no application flow. The Studio does not offer one.</li>
          <li>Derived values and suggested links are not drawn as relationships. Only persisted links are.</li>
        </ul>
        <p className="studio-inspector-basis">
          <ShieldCheck aria-hidden="true" size={13} /> Server permissions decide every action. This surface only shows what the server returned.
        </p>
      </section>
    </aside>
  );
}

function ActionList({
  actions,
  onFocus,
}: {
  actions: StudioAction[];
  onFocus: (focus: string | null) => void;
}) {
  if (!actions.length) {
    return <p className="studio-inspector-basis">No action is attached to this record.</p>;
  }
  return (
    <ul className="studio-action-list">
      {actions.map(action => (
        <li key={action.id}>
          {action.available && action.kind === 'navigation' && action.href ? (
            <a className="studio-action-link" href={action.href}>{action.label}</a>
          ) : action.available && action.kind === 'focus' && action.payload.focus ? (
            <button className="studio-action-link" onClick={() => onFocus(action.payload.focus as string)} type="button">
              {action.label}
            </button>
          ) : action.available ? (
            <span className="studio-action-link studio-action-server">{action.label}</span>
          ) : (
            <span className="studio-action-blocked" title={action.blockedReason ?? undefined}>
              {action.label}
            </span>
          )}
          {action.blockedReason && <small className="studio-action-reason">{action.blockedReason}</small>}
          {action.disclosure && <small className="studio-action-reason">{action.disclosure}</small>}
        </li>
      ))}
    </ul>
  );
}

