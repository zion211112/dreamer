import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import {
  ENTITY_TYPES,
  isPrimaryEntity,
  type NetworkEntity,
  type NetworkRelationship,
} from '../../lib/people-network';
import { getContextualAnchorLinks, type PeopleDirectoryEntry } from '../../lib/people-discovery';
import { PeopleProfileEditor } from './PeopleProfileEditor';
import {
  createImportedPeopleProfile,
  getCapabilityEvidence,
  getDisplayableContactMethods,
  getPeopleProfileForSubject,
  type PeopleEvidence,
  type PeopleProfileRecord,
  type PeopleServiceOffer,
} from '../../lib/people-profiles';

interface EntityInspectorProps {
  entity: NetworkEntity | null;
  directoryEntry?: PeopleDirectoryEntry;
  profiles?: PeopleProfileRecord[];
  profileOwnerId: string;
  profileStoreReady: boolean;
  evidenceRecords?: PeopleEvidence[];
  mobileOpen: boolean;
  entities: NetworkEntity[];
  relationships: NetworkRelationship[];
  recordScope: 'sample' | 'imported';
  onSelect: (entity: NetworkEntity) => void;
  onClose: () => void;
  onSaveProfile: (profile: PeopleProfileRecord) => void;
}

const anchorIds = new Set([
  'asset-kemetos1',
  'asset-school-management-console',
  'asset-lake-basin-cold-store-chamber-a',
  'institution-open-design',
  'asset-kimunye-tea-factory',
]);

const claimSourceLabels = {
  'self-declared': 'Self-declared',
  attributed: 'Attributed',
  unspecified: 'Source not stated',
} as const;

const evidenceTypeLabels = {
  'work-sample': 'Work sample',
  reference: 'Reference',
  credential: 'Credential',
  'institutional-attestation': 'Institutional attestation',
  'accepted-contribution': 'Accepted contribution',
} as const;

function contactHref(type: string, value: string): string | null {
  if (type === 'email') return `mailto:${value}`;
  if (type === 'phone') return `tel:${value}`;
  if (type !== 'website') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function profileOriginLabel(profile: PeopleProfileRecord | undefined, recordScope: 'sample' | 'imported'): string {
  if (!profile) return recordScope === 'sample' ? 'Sample record' : 'Imported portable record';
  if (profile.origin === 'user-authored') return 'Browser-local revision';
  if (profile.origin === 'studio-example') return 'Studio example';
  return 'Imported profile';
}

function OfferDetails({ offer }: { offer: PeopleServiceOffer }) {
  return (
    <article className="people-offer">
      <h4>{offer.title}</h4>
      {offer.scope && <p>{offer.scope}</p>}
      {offer.deliverables.length > 0 && <p>Deliverables: {offer.deliverables.join(', ')}</p>}
      {offer.serviceArea && <small>Service area: {offer.serviceArea}</small>}
      {offer.indicativeTerms && <small>Indicative terms: {offer.indicativeTerms}</small>}
    </article>
  );
}

export function EntityInspector({
  entity,
  directoryEntry,
  profiles = [],
  profileOwnerId,
  profileStoreReady,
  evidenceRecords = [],
  mobileOpen,
  entities,
  relationships: allRelationships,
  recordScope,
  onSelect,
  onClose,
  onSaveProfile,
}: EntityInspectorProps) {
  const [isMobile, setIsMobile] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setIsMobile(document.documentElement.clientWidth <= 760);
    update();
    media.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isMobile || !mobileOpen) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const focusable = asideRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isMobile, mobileOpen, entity?.id]);

  if (!entity) {
    return (
      <aside className="people-inspector people-inspector--empty" aria-label="Profile details">
        <p>Select a person or crew to see their capabilities, work, and explicit connections.</p>
      </aside>
    );
  }

  const typeLabel = ENTITY_TYPES.find(type => type.id === entity.type)?.label ?? entity.type;
  const entityById = new Map(entities.map(item => [item.id, item]));
  const directRelationships = allRelationships.flatMap(relationship => {
    if (relationship.sourceId !== entity.id && relationship.targetId !== entity.id) return [];
    const isSource = relationship.sourceId === entity.id;
    const related = entityById.get(isSource ? relationship.targetId : relationship.sourceId);
    if (!related) return [];
    return [{
      id: relationship.id,
      entity: related,
      verb: relationship.verb,
      direction: isSource ? '→' : '←',
    }];
  });
  const profile = getPeopleProfileForSubject(profiles, entity.id);
  const claims = directoryEntry?.claims ?? [];
  const offers = directoryEntry?.offers ?? profile?.offers ?? [];
  const contacts = profile ? getDisplayableContactMethods(profile) : [];
  const availability = directoryEntry?.availability ?? profile?.availability ?? 'not-stated';
  const availabilityLabel = {
    'open-to-enquiries': 'Open to enquiries',
    'limited-availability': 'Limited availability',
    'not-taking-work': 'Not currently taking work',
    'not-stated': 'Not stated',
  }[availability];
  const validAnchorIds = new Set([...anchorIds].filter(id => entityById.has(id)));
  const contextualAnchorLinks = getContextualAnchorLinks(entity.id, allRelationships, validAnchorIds);
  const directlyRelated = directRelationships.filter(item => item.entity.id !== entity.id);
  const workAndEvidence = directlyRelated.filter(item => item.entity.type === 'work' || item.entity.type === 'evidence');
  const collaborations = directlyRelated.filter(item => item.entity.type !== 'work' && item.entity.type !== 'evidence');
  const dialogOpen = isMobile && mobileOpen;

  return (
    <>
      {dialogOpen && (
        <button
          type="button"
          className="people-inspector-backdrop"
          onClick={onClose}
          aria-label="Close profile details"
        />
      )}
      <aside
        ref={asideRef}
        className={`people-inspector${mobileOpen ? '' : ' is-mobile-closed'}`}
        aria-label={`${typeLabel} details`}
        role={dialogOpen ? 'dialog' : undefined}
        aria-modal={dialogOpen ? 'true' : undefined}
        aria-labelledby="people-inspector-title"
        tabIndex={dialogOpen ? -1 : undefined}
      >
      <header className="people-inspector-header">
        <div className="people-inspector-heading">
          <span className={`people-type-mark people-type-mark--${entity.type}`} aria-hidden="true" />
          <div>
            <p className="people-inspector-eyebrow">{typeLabel} · {profileOriginLabel(profile, recordScope)}</p>
            <h2 id="people-inspector-title">{entity.name}</h2>
          </div>
        </div>
        <button ref={closeRef} className="people-inspector-close" type="button" onClick={onClose} aria-label="Close details">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="people-inspector-content">
        <section className="people-inspector-summary">
          <span className="people-inspector-role">{entity.role}</span>
          <p>{entity.summary}</p>
          <div className="people-context-tags">
            {entity.location && <span className="people-context-tag">{entity.location}</span>}
            <span className="people-context-tag people-context-tag--signal">
              {recordScope === 'sample' ? 'Sample data · not live records' : 'Imported portable record'}
            </span>
            {entity.assetReference && <span className="people-context-tag">Sample register · {entity.assetReference}</span>}
            {entity.recordBasis && (
              <span className="people-context-tag">
                {entity.recordBasis === 'illustrative' ? 'Illustrative example'
                  : entity.recordBasis === 'local-profile' ? 'Local profile'
                    : 'Project-reported'}
              </span>
            )}
            {entity.commonsContribution && <span className="people-context-tag people-context-tag--commons">Commons contribution</span>}
            {profile?.sourceRecordId && <span className="people-context-tag">Revision of {profile.sourceRecordId}</span>}
          </div>
        </section>

        <section className="people-inspector-section" aria-labelledby="people-practice-heading">
          <div className="people-inspector-section-heading">
            <h3 id="people-practice-heading">Capabilities &amp; services</h3>
          </div>
          {claims.length ? (
            <ul className="people-claim-list">
              {claims.map(claim => {
                const linkedEvidence = getCapabilityEvidence(claim.id, evidenceRecords);
                return (
                  <li key={claim.id}>
                    <strong>{claim.name}</strong>
                    <span>{claimSourceLabels[claim.claimSource]}</span>
                    {claim.scope && <p>{claim.scope}</p>}
                    {linkedEvidence.length > 0 ? (
                      <ul className="people-evidence-list">
                        {linkedEvidence.map(evidence => (
                          <li key={evidence.id}>
                            <strong>{evidenceTypeLabels[evidence.type]}</strong>
                            <span>{evidence.suppliedBy}{evidence.issuedBy ? ` · issued by ${evidence.issuedBy}` : ''}</span>
                            <small>
                              Source {evidence.sourceId} · {evidence.verificationStatus === 'verified'
                                ? `Verified${evidence.verifiedBy ? ` by ${evidence.verifiedBy}` : ''}`
                                : 'Not verified'}
                            </small>
                          </li>
                        ))}
                      </ul>
                    ) : claim.evidenceIds.length > 0 ? (
                      <small className="people-evidence-unavailable">Evidence record details are not available in this local view.</small>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          ) : entity.capabilities.length ? (
            <p className="people-no-connections">Catalog capability terms; no profile claim records are available.</p>
          ) : (
            <p className="people-no-connections">No capability claims are recorded.</p>
          )}
          {offers.length > 0 && <div className="people-offer-list">{offers.map(offer => <OfferDetails key={offer.id} offer={offer} />)}</div>}
          <div className="people-availability">
            <span>Availability</span>
            <strong>{availabilityLabel}</strong>
            {profile?.availabilityUpdatedAt && <small>Last updated {profile.availabilityUpdatedAt}</small>}
          </div>
        </section>

        <section className="people-inspector-section" aria-labelledby="people-work-heading">
          <div className="people-inspector-section-heading"><h3 id="people-work-heading">Selected work &amp; evidence</h3></div>
          {workAndEvidence.length ? (
            <ul className="people-context-list">
              {workAndEvidence.map(({ id, entity: related, verb, direction }) => (
                <li key={id}>
                  <span>{related.type}</span>
                  <strong>{related.name}</strong>
                  <small>{direction} {verb}{related.context ? ` · ${related.context}` : ''}</small>
                </li>
              ))}
            </ul>
          ) : <p className="people-no-connections">No work or evidence records are explicitly linked.</p>}
        </section>

        <section className="people-inspector-section" aria-labelledby="people-collaborations-heading">
          <div className="people-inspector-section-heading">
            <h3 id="people-collaborations-heading">Collaborations &amp; affiliations</h3>
            <span>{collaborations.length.toString().padStart(2, '0')}</span>
          </div>
          {collaborations.length ? (
            <ul className="people-connection-list">
              {collaborations.map(({ id, entity: related, verb, direction }) => {
                const connectedType = ENTITY_TYPES.find(type => type.id === related.type)?.label ?? related.type;
                if (!isPrimaryEntity(related)) {
                  return (
                    <li key={id} className="people-connection-reference">
                      <span className="people-connection-copy">
                        <span className="people-connection-verb">{direction === '→' ? `${verb} →` : `← ${verb}`}</span>
                        <span className="people-connection-name">{related.name}</span>
                      </span>
                      <span className="people-connection-type">{connectedType}</span>
                    </li>
                  );
                }
                return (
                  <li key={id}>
                    <button
                      type="button"
                      className="people-connection"
                      onClick={() => onSelect(related)}
                      aria-label={`${direction === '→' ? verb : `is ${verb} by`} ${connectedType}: ${related.name}`}
                    >
                      <span className={`people-connection-mark people-connection-mark--${related.type}`} aria-hidden="true" />
                      <span className="people-connection-copy">
                        <span className="people-connection-verb">{direction === '→' ? `${verb} →` : `← ${verb}`}</span>
                        <span className="people-connection-name">{related.name}</span>
                      </span>
                      <span className="people-connection-type">{connectedType}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : <p className="people-no-connections">No affiliations or collaborations are explicitly linked.</p>}
          {contextualAnchorLinks.length > 0 && (
            <div className="people-anchor-links" aria-label="Linked Studio anchors">
              <span>Linked Studio records</span>
              {contextualAnchorLinks.map(id => {
                const anchor = entityById.get(id);
                if (!anchor) return null;
                return isPrimaryEntity(anchor)
                  ? <button type="button" key={id} onClick={() => onSelect(anchor)}>{anchor.name} →</button>
                  : <span key={id}>{anchor.name}</span>;
              })}
            </div>
          )}
        </section>

        <section className="people-inspector-section" aria-labelledby="people-contact-heading">
          <div className="people-inspector-section-heading"><h3 id="people-contact-heading">Contact preferences</h3></div>
          {contacts.length ? (
            <ul className="people-contact-list">
              {contacts.map(contact => {
                const href = contactHref(contact.type, contact.value);
                return (
                  <li key={contact.id}>
                    {href ? <a href={href}>{contact.value}</a> : <span>{contact.value}</span>}
                    {contact.preferred && <small>Preferred</small>}
                  </li>
                );
              })}
            </ul>
          ) : <p className="people-no-connections">No contact method has been selected for display.</p>}
          {recordScope === 'imported' && (entity.type === 'person' || entity.type === 'crew') && (
            <div className="people-profile-revision">
              <h4>Your local revision</h4>
              {profileStoreReady && profileOwnerId ? (
                <PeopleProfileEditor
                  key={`${entity.id}:${profileOwnerId}`}
                  baseline={createImportedPeopleProfile(entity)}
                  profile={profile}
                  ownerId={profileOwnerId}
                  onSave={onSaveProfile}
                />
              ) : (
                <p className="people-profile-editor-note">
                  {profileStoreReady
                    ? 'No browser-local demo identity is available, so this record cannot be revised here.'
                    : 'Local profile storage is unavailable, so editing is disabled.'}
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="people-inspector-footer">
        <span className="people-sample-indicator" />
        {recordScope === 'sample' ? 'Shared example · not live activity'
          : profile?.origin === 'user-authored' ? 'Imported record · local revision only'
            : 'Imported portable record'}
      </footer>
      </aside>
    </>
  );
}
