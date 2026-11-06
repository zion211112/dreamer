import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';
import { CommonsReportForm } from './commons/ReportForm';
import { CommonsGovernance } from './commons/GovernancePanel';
import { CommonsOpportunities } from './commons/OpportunitiesPanel';
import { RadarSpatialPanel } from '../../components/RadarSpatialPanel';
import { CommonsSignalQueue } from './commons/CommonsSignalQueue';
import { CommonsSignalDetail } from './commons/CommonsSignalDetail';
import { useCommons } from './commons/useCommons';

export function Commons() {
  const {
    contributeButtonRef,
    reportInstitutionRef,
    commonsView,
    setCommonsView,
    institutionScope,
    setInstitutionScope,
    setSelectedId,
    filter,
    setFilter,
    search,
    setSearch,
    setSignalPage,
    showReportForm,
    setShowReportForm,
    showContributionMenu,
    setShowContributionMenu,
    selectedOpportunityId,
    setSelectedOpportunityId,
    sourceConsoleDraftId,
    reportTitle,
    setReportTitle,
    reportDetails,
    setReportDetails,
    error,
    loaded,
    actorEmail,
    governance,
    showProposalForm,
    setShowProposalForm,
    newStewardEmail,
    setNewStewardEmail,
    decisionNotes,
    setDecisionNotes,
    institutionNames,
    visibleSignals,
    paginatedSignals,
    selected,
    featuredPossibility,
    activeInstitutionId,
    activeInstitutionName,
    scopeInstitutionName,
    activeStewards,
    isSteward,
    approvedProposal,
    registerInitialSteward,
    addSteward,
    submitProposal,
    recordDecision,
    submitReport,
    closeReportForm,
    changeStatus,
    addNote,
    navigate,
    note,
    setNote,
  } = useCommons();

  return (
    <WorkspaceLayout currentContext="commons">
      <div className="signal-desk">
        <div className="signal-desk-head">
          <PageHead
            eyebrow="COMMONS / RADAR KWA GROUND"
            title="Signals from the ground"
          />
          <div className="signal-head-actions">
            <div className="commons-contribute">
              <button
                aria-expanded={showContributionMenu}
                className="signal-primary-action"
                onClick={() => {
                  if (showReportForm) closeReportForm();
                  else setShowContributionMenu(value => !value);
                }}
                ref={contributeButtonRef}
                type="button"
              >
                {showReportForm ? 'Close form' : '+ Contribute'}
              </button>
              {showContributionMenu && (
                <div aria-label="Contribution options" className="commons-contribute-menu" role="group">
                  <button
                    onClick={() => {
                      setShowContributionMenu(false);
                      setShowReportForm(true);
                    }}
                    type="button"
                  >
                    Add a signal
                  </button>
                  <button
                    onClick={() => {
                      setShowContributionMenu(false);
                      setCommonsView('opportunities');
                    }}
                    type="button"
                  >
                    Explore opportunities
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="commons-modebar" aria-label="Commons views">
          <button
            aria-pressed={commonsView === 'signals'}
            className={commonsView === 'signals' ? 'is-active' : ''}
            onClick={() => setCommonsView('signals')}
            type="button"
          >
            Signals <span>{visibleSignals.length.toString().padStart(2, '0')}</span>
          </button>
          <button
            aria-pressed={commonsView === 'opportunities'}
            className={commonsView === 'opportunities' ? 'is-active' : ''}
            onClick={() => setCommonsView('opportunities')}
            type="button"
          >
            Opportunities
          </button>
          <button
            aria-pressed={commonsView === 'decisions'}
            className={commonsView === 'decisions' ? 'is-active' : ''}
            onClick={() => setCommonsView('decisions')}
            type="button"
          >
            Decisions <span>{governance.proposals.length.toString().padStart(2, '0')}</span>
          </button>
          <label className="commons-scope-select" hidden={commonsView === 'opportunities'}>
            <span className="visually-hidden">Institution scope</span>
            <select
              onChange={event => {
                const nextInstitutionId = (event.currentTarget as HTMLSelectElement).value;
                setInstitutionScope(nextInstitutionId);
                setSignalPage(0);
              }}
              value={institutionScope}
            >
              <option value="">All institutions</option>
              {institutionNames && Object.entries(institutionNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </label>
          <span className="commons-mode-hint">{scopeInstitutionName}</span>
        </nav>

        {error && <p className="local-data-warning" role="alert">{error}</p>}

        {showReportForm && (
          <CommonsReportForm
            institutionNames={institutionNames}
            onReportDetailsChange={setReportDetails}
            onReportTitleChange={setReportTitle}
            onSubmit={submitReport}
            onCancel={closeReportForm}
            reportDetails={reportDetails}
            reportInstitutionRef={reportInstitutionRef}
            reportTitle={reportTitle}
            sourceConsoleDraftId={sourceConsoleDraftId}
          />
        )}

        <CommonsGovernance
          activeInstitutionId={activeInstitutionId}
          activeInstitutionName={activeInstitutionName}
          activeStewards={activeStewards}
          addSteward={addSteward}
          actorEmail={actorEmail}
          decisionNotes={decisionNotes}
          governance={governance}
          isSteward={isSteward}
          newStewardEmail={newStewardEmail}
          recordDecision={recordDecision}
          registerInitialSteward={registerInitialSteward}
          selected={selected}
          setDecisionNotes={setDecisionNotes}
          setNewStewardEmail={setNewStewardEmail}
          setShowProposalForm={setShowProposalForm}
          showProposalForm={showProposalForm}
          submitProposal={submitProposal}
        />

        <CommonsOpportunities selectedOpportunityId={selectedOpportunityId} setSelectedOpportunityId={setSelectedOpportunityId} />

        <section aria-label="Field signal workspace" className="signal-workspace" hidden={commonsView !== 'signals'}>
          <CommonsSignalQueue
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            institutionScope={institutionScope}
            setInstitutionScope={setInstitutionScope}
            loaded={loaded}
            paginatedSignals={paginatedSignals}
            selected={selected}
            setSelectedId={setSelectedId}
            featuredPossibility={featuredPossibility}
            setCommonsView={setCommonsView}
            setSignalPage={setSignalPage}
          />

          <RadarSpatialPanel signals={visibleSignals} />

          <CommonsSignalDetail
            selected={selected}
            isSteward={isSteward}
            approvedProposal={approvedProposal}
            onChangeStatus={changeStatus}
            onOpenSourceDraft={draftId => navigate(`/workspace/institutions/school-console?draft=${encodeURIComponent(draftId)}#school-draft-${encodeURIComponent(draftId)}`)}
            onOpenWorkBrief={proposalId => navigate(`/workspace/workbench?proposal=${encodeURIComponent(proposalId)}`)}
            onSetCommonsView={setCommonsView}
            onAddNote={addNote}
            note={note}
            setNote={setNote}
          />
        </section>
      </div>
    </WorkspaceLayout>
  );
}
