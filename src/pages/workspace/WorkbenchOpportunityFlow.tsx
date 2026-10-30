import { useEffect, useMemo, useState } from 'preact/hooks';
import {
  acceptLocalAuthorization,
  authorizeLocalWork,
  beginLocalReview,
  createLocalApplication,
  decideLocalApplication,
  readLocalWorkbench,
  reviewLocalDelivery,
  submitLocalDelivery,
  WORK_OPPORTUNITIES,
  writeLocalWorkbench,
  type LocalWorkApplication,
  type LocalWorkbenchRecord,
  type WorkOpportunity,
} from '../../lib/local-workbench';

type View = 'opportunities' | 'my-work';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getDefaultApplicant(): string {
  try {
    const raw = localStorage.getItem('authUser');
    if (!raw) return 'Kemoly Murage';
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return 'Kemoly Murage';
    const user = parsed;
    const name = typeof user.name === 'string' ? user.name.trim()
      : typeof user.fullName === 'string' ? user.fullName.trim() : '';
    return name || 'Kemoly Murage';
  } catch {
    return 'Kemoly Murage';
  }
}

function statusLabel(application: LocalWorkApplication): string {
  if (application.workStatus === 'authorization_pending') return 'Awaiting authorization';
  if (application.workStatus === 'authorized') return 'Authorized · awaiting contributor';
  if (application.workStatus === 'in_progress') return 'In progress';
  if (application.workStatus === 'submitted') return 'Delivery submitted';
  if (application.workStatus === 'changes_requested') return 'Changes requested';
  if (application.workStatus === 'accepted') return 'Accepted · credential eligible';
  if (application.status === 'submitted') return 'Application saved locally';
  if (application.status === 'under_review') return 'Review in progress · local';
  if (application.status === 'selected') return 'Selected locally';
  return 'Declined locally';
}

function persist(
  next: LocalWorkbenchRecord,
  setRecord: (record: LocalWorkbenchRecord) => void,
) {
  writeLocalWorkbench(next);
  setRecord(next);
}

function OpportunityCard({
  opportunity,
  active,
  application,
  onSelect,
}: {
  opportunity: WorkOpportunity;
  active: boolean;
  application?: LocalWorkApplication;
  onSelect: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`wb-opportunity-card${active ? ' is-active' : ''}`}
      onClick={onSelect}
      type="button"
    >
      <span className="wb-card-kicker">{opportunity.discipline} · Work context</span>
      <strong>{opportunity.title}</strong>
      <span className="wb-card-context">{opportunity.context}</span>
      <span className="wb-card-terms">{application ? statusLabel(application) : 'Terms required before a real call opens'}</span>
    </button>
  );
}

export function WorkbenchOpportunityFlow({ view }: { view: View }) {
  const [record, setRecord] = useState<LocalWorkbenchRecord>({ applications: [] });
  const [selectedId, setSelectedId] = useState(WORK_OPPORTUNITIES[0].id);
  const [applicant] = useState(getDefaultApplicant);
  const [note, setNote] = useState('');
  const [shareEvidence, setShareEvidence] = useState(false);
  const [applicationNotes, setApplicationNotes] = useState<Record<string, string>>({});
  const [deliveryNotes, setDeliveryNotes] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setRecord(readLocalWorkbench());
      setReady(true);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Workbench activity could not be loaded.');
    }
  }, []);

  const selectedOpportunity = WORK_OPPORTUNITIES.find(item => item.id === selectedId) ?? WORK_OPPORTUNITIES[0];
  const existingApplication = record.applications.find(application => (
    application.opportunityId === selectedOpportunity.id
      && application.applicant === applicant
      && application.status !== 'declined'
  ));
  const applications = useMemo(
    () => record.applications.filter(application => application.applicant === applicant),
    [record.applications, applicant],
  );

  function runAction(action: () => LocalWorkbenchRecord, success: string) {
    setActionError('');
    setConfirmation('');
    try {
      persist(action(), setRecord);
      setConfirmation(success);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The local workflow action could not be completed.');
    }
  }

  function saveApplication(event: Event) {
    event.preventDefault();
    setActionError('');
    setConfirmation('');
    try {
      const next = createLocalApplication(record, selectedOpportunity.id, applicant, note, shareEvidence);
      persist(next, setRecord);
      setNote('');
      setShareEvidence(false);
      setConfirmation('Application saved in this browser. Nothing was sent to an institution.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'The local application could not be saved.');
    }
  }

  function getOpportunity(application: LocalWorkApplication) {
    return WORK_OPPORTUNITIES.find(item => item.id === application.opportunityId) ?? WORK_OPPORTUNITIES[0];
  }

  return (
    <section className="wb-flow">
      {!ready && !loadError && <p className="wb-feedback" role="status">Loading local Workbench activity…</p>}
      {(loadError || actionError) && <p className="wb-feedback is-error" role="alert">{loadError || actionError}</p>}
      {confirmation && <p className="wb-feedback" role="status">{confirmation}</p>}

      {view === 'opportunities' ? (
        <div className="wb-opportunity-layout">
          <aside className="wb-opportunity-list" aria-label="Work contexts">
            <header className="wb-panel-heading">
              <span>Work contexts</span>
              <small>03</small>
            </header>
            <div className="wb-opportunity-items">
              {WORK_OPPORTUNITIES.map(opportunity => (
                <OpportunityCard
                  active={selectedOpportunity.id === opportunity.id}
                  application={record.applications.find(application => application.opportunityId === opportunity.id)}
                  key={opportunity.id}
                  onSelect={() => {
                    setSelectedId(opportunity.id);
                    setNote('');
                    setActionError('');
                    setConfirmation('');
                  }}
                  opportunity={opportunity}
                />
              ))}
            </div>
          </aside>

          <article className="wb-opportunity-detail">
            <div className="wb-detail-heading">
              <span className="wb-eyebrow">{selectedOpportunity.discipline} / Opportunity brief</span>
              <h2>{selectedOpportunity.title}</h2>
              <p>{selectedOpportunity.summary}</p>
              <div className="wb-detail-meta">
                <span><small>Work area</small><strong>{selectedOpportunity.context}</strong></span>
                <span><small>Engagement terms</small><strong>Set by publishing institution</strong></span>
              </div>
            </div>

            <div className="wb-detail-body">
              <section>
                <h3>Scope</h3>
                <p>{selectedOpportunity.scope}</p>
              </section>
              <section>
                <h3>Expected evidence</h3>
                <ul>{selectedOpportunity.deliverables.map(item => <li key={item}>{item}</li>)}</ul>
              </section>
              <section>
                <h3>Capabilities sought</h3>
                <ul>{selectedOpportunity.capability.map(item => <li key={item}>{item}</li>)}</ul>
              </section>
              <section>
                <h3>Acceptance</h3>
                <p>{selectedOpportunity.acceptance}</p>
              </section>
              <div className="wb-terms-box">
                <span className="wb-eyebrow">TERMS BEFORE APPLICATION</span>
                <p>{selectedOpportunity.terms}</p>
                <strong>{selectedOpportunity.payment}</strong>
              </div>

              {existingApplication ? (
                <div className="wb-existing-application">
                  <span className="wb-eyebrow">LOCAL WORKFLOW</span>
                  <strong>{statusLabel(existingApplication)}</strong>
                  <p>This browser has a local application for this work context. It has not been sent to an institution.</p>
                </div>
              ) : (
                <form className="wb-application-form" onSubmit={saveApplication}>
                  <label htmlFor="wb-application-note">Your application note</label>
                  <textarea
                    id="wb-application-note"
                    onInput={event => setNote(event.currentTarget.value)}
                    placeholder="Describe the relevant capability, approach, and availability."
                    rows={4}
                    value={note}
                  />
                  <label className="wb-consent">
                    <input
                      checked={shareEvidence}
                      onChange={event => setShareEvidence(event.currentTarget.checked)}
                      type="checkbox"
                    />
                    <span>Include relevant profile evidence with this local application.</span>
                  </label>
                  <div className="wb-form-footer">
                    <span>Terms must be published before a real application can be submitted.</span>
                    <button className="wb-primary-button" disabled={!ready || !note.trim()} type="submit">Save application locally</button>
                  </div>
                </form>
              )}
            </div>
          </article>

          <aside className="wb-profile-rail" aria-label="Contributor and workflow">
            <section className="wb-rail-section">
              <span className="wb-eyebrow">CONTRIBUTOR PROFILE</span>
              <div className="wb-profile">
                <span className="wb-avatar" aria-hidden="true">KM</span>
                <span><strong>{applicant}</strong><small>Local profile</small></span>
              </div>
              <p className="wb-profile-capabilities">Animation · AGI systems · systems design</p>
              <span className="wb-credential-note">No verified credential is connected to this local profile.</span>
            </section>
            <section className="wb-rail-section">
              <span className="wb-eyebrow">FROM APPLICATION TO PROOF</span>
              <ol className="wb-steps">
                <li>Institution reviews</li>
                <li>Work is explicitly authorized</li>
                <li>Contributor submits evidence</li>
                <li>Institution records acceptance</li>
                <li>Issuer separately decides on a credential</li>
              </ol>
            </section>
            <section className="wb-rail-section wb-issuer-state">
              <span className="wb-eyebrow">ISSUER STATUS</span>
              <strong>Not connected</strong>
              <p>Accepted work can become credential-eligible. No credential is issued here.</p>
            </section>
          </aside>
        </div>
      ) : (
        <div className="wb-my-work">
          <header className="wb-my-work-heading">
            <div>
              <span className="wb-eyebrow">YOUR WORKFLOW</span>
              <h2>Applications and work</h2>
            </div>
            <span>{applications.length.toString().padStart(2, '0')} local records</span>
          </header>
          {applications.length === 0 ? (
            <div className="wb-empty-state">
              <span className="wb-eyebrow">NO APPLICATIONS SAVED</span>
              <h3>Start with a work context.</h3>
              <p>Preparing an application here saves it only in this browser.</p>
            </div>
          ) : (
            <div className="wb-application-list">
              {applications.map(application => {
                const opportunity = getOpportunity(application);
                return (
                  <article className="wb-application-card" key={application.id}>
                    <header className="wb-application-card-head">
                      <div>
                        <span className="wb-eyebrow">{opportunity.discipline} · LOCAL RECORD</span>
                        <h3>{opportunity.title}</h3>
                      </div>
                      <span className="wb-status-pill">{statusLabel(application)}</span>
                    </header>
                    <p className="wb-applicant-note">{application.note}</p>
                    <p className="wb-evidence-choice">
                      Profile evidence: {application.shareEvidence ? 'included by contributor choice' : 'not shared'}
                    </p>

                    {application.status === 'submitted' && (
                      <div className="wb-review-action">
                        <p>Institution review is represented locally. No institution has received this application.</p>
                        <button
                          className="wb-secondary-button"
                          disabled={!ready}
                          onClick={() => runAction(
                            () => beginLocalReview(record, application.id),
                            'Local review started. No institution was notified.',
                          )}
                          type="button"
                        >Begin local review</button>
                      </div>
                    )}

                    {application.status === 'under_review' && (
                      <div className="wb-review-action">
                        <label className="wb-inline-field">
                          Local decision note
                          <textarea
                            onInput={event => setApplicationNotes(current => ({ ...current, [application.id]: event.currentTarget.value }))}
                            placeholder="Record the reason for the local decision."
                            rows={2}
                            value={applicationNotes[application.id] ?? ''}
                          />
                        </label>
                        <div className="wb-action-row">
                          <button
                            className="wb-secondary-button"
                            disabled={!ready || !(applicationNotes[application.id] ?? '').trim()}
                            onClick={() => runAction(
                              () => decideLocalApplication(record, application.id, 'declined', applicationNotes[application.id] ?? ''),
                              'Decision saved locally.',
                            )}
                            type="button"
                          >Decline locally</button>
                          <button
                            className="wb-primary-button"
                            disabled={!ready || !(applicationNotes[application.id] ?? '').trim()}
                            onClick={() => runAction(
                              () => decideLocalApplication(record, application.id, 'selected', applicationNotes[application.id] ?? ''),
                              'Selection saved locally; work is still unauthorized.',
                            )}
                            type="button"
                          >Select for work</button>
                        </div>
                      </div>
                    )}

                    {application.status === 'selected' && application.workStatus === 'authorization_pending' && (
                      <div className="wb-review-action">
                        <p>Selection is not authorization. Confirm the final scope and terms before recording local authorization.</p>
                        <button
                          className="wb-primary-button"
                          disabled={!ready}
                          onClick={() => runAction(
                            () => authorizeLocalWork(record, application.id),
                            'Authorization recorded locally. No work order was issued.',
                          )}
                          type="button"
                        >Authorize work locally</button>
                      </div>
                    )}

                    {application.workStatus === 'authorized' && (
                      <div className="wb-review-action">
                        <p>The local institution step is complete. The contributor must accept before work begins.</p>
                        <button
                          className="wb-primary-button"
                          disabled={!ready}
                          onClick={() => runAction(
                            () => acceptLocalAuthorization(record, application.id),
                            'Work marked in progress locally.',
                          )}
                          type="button"
                        >Accept authorization &amp; begin</button>
                      </div>
                    )}

                    {(application.workStatus === 'in_progress' || application.workStatus === 'changes_requested') && (
                      <div className="wb-review-action">
                        <label className="wb-inline-field">
                          Delivery evidence
                          <textarea
                            onInput={event => setDeliveryNotes(current => ({ ...current, [application.id]: event.currentTarget.value }))}
                            placeholder="Describe the delivered work and evidence for the acceptance criteria."
                            rows={3}
                            value={deliveryNotes[application.id] ?? application.deliveryEvidence}
                          />
                        </label>
                        <button
                          className="wb-primary-button"
                          disabled={!ready || !(deliveryNotes[application.id] ?? application.deliveryEvidence).trim()}
                          onClick={() => runAction(
                            () => submitLocalDelivery(record, application.id, deliveryNotes[application.id] ?? application.deliveryEvidence),
                            'Delivery evidence saved locally for institution review.',
                          )}
                          type="button"
                        >Save delivery evidence locally</button>
                      </div>
                    )}

                    {application.workStatus === 'submitted' && (
                      <div className="wb-review-action">
                        <p><strong>Evidence submitted locally</strong><br />{application.deliveryEvidence}</p>
                        <label className="wb-inline-field">
                          Institution review note
                          <textarea
                            onInput={event => setApplicationNotes(current => ({ ...current, [application.id]: event.currentTarget.value }))}
                            placeholder="Record the acceptance decision or requested changes."
                            rows={2}
                            value={applicationNotes[application.id] ?? ''}
                          />
                        </label>
                        <div className="wb-action-row">
                          <button
                            className="wb-secondary-button"
                            disabled={!ready || !(applicationNotes[application.id] ?? '').trim()}
                            onClick={() => runAction(
                              () => reviewLocalDelivery(record, application.id, 'changes_requested', applicationNotes[application.id] ?? ''),
                              'Changes requested in the local workflow.',
                            )}
                            type="button"
                          >Request changes</button>
                          <button
                            className="wb-primary-button"
                            disabled={!ready || !(applicationNotes[application.id] ?? '').trim()}
                            onClick={() => runAction(
                              () => reviewLocalDelivery(record, application.id, 'accepted', applicationNotes[application.id] ?? ''),
                              'Acceptance recorded locally; no credential was issued.',
                            )}
                            type="button"
                          >Accept delivery locally</button>
                        </div>
                      </div>
                    )}

                    {application.workStatus === 'accepted' && (
                      <div className="wb-credential-eligible">
                        <strong>Credential eligible · issuer action required</strong>
                        <p>Acceptance is not a credential. An authorized issuer and a verified Issuer2 configuration are not connected.</p>
                      </div>
                    )}

                    {application.status === 'declined' && (
                      <div className="wb-credential-eligible">
                        <strong>Local application declined</strong>
                        <p>{application.decisionNote}</p>
                      </div>
                    )}

                    <details className="wb-history">
                      <summary>Local activity history <span>{application.events.length.toString().padStart(2, '0')}</span></summary>
                      <ol>
                        {application.events.map(item => (
                          <li key={item.id}>
                            <span>{item.action.replaceAll('_', ' ')}</span>
                            <small>{item.actor} · {new Date(item.createdAt).toLocaleString()}</small>
                            <p>{item.note}</p>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
