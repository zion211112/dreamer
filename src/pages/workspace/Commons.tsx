import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';
import { CommonsReportForm } from './commons/ReportForm';
import { CommonsSignalQueue } from './commons/CommonsSignalQueue';
import { CommonsSignalDetail } from './commons/CommonsSignalDetail';
import { CommonsGovernance } from './commons/GovernancePanel';
import { CommonsOpportunities } from './commons/OpportunitiesPanel';
import { useCommons } from './commons/useCommons';
import { RadarSpatialPanel } from '../../components/RadarSpatialPanel';

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
             eyebrow="Commons"
             title="Signals and decisions"
             subtitle="Capture local observations, review opportunities, and record steward decisions."
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
                setInstitutionScope((event.currentTarget as HTMLSelectElement).value);
                setSignalPage(0);
              }}
              value={institutionScope}
            >
              <option value="">All institutions</option>
              {Object.entries(institutionNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </label>
          <span className="commons-mode-hint">{scopeInstitutionName}</span>
         </nav>

        {error && <p className="local-data-warning" role="alert">{error}</p>}

        <section aria-labelledby="commons-modules-title" className="commons-modules-hub">
          <div className="commons-modules-head">
            <div>
              <p className="eyebrow">Commons · modules</p>
              <h2 id="commons-modules-title">All modules</h2>
              <p>Open any workspace module from here.</p>
            </div>
          </div>
          <div className="commons-modules-grid">
            <a
              href="/workspace"
              className="commons-module-link"
              aria-label="Open workspace home"
            >
              <div className="commons-module-icon" aria-hidden="true">⌂</div>
              <div className="commons-module-copy">
                <span className="commons-module-label">Workspace home</span>
                <span className="commons-module-desc">Your personal space and first steps.</span>
              </div>
            </a>
            <a
              href="/workspace/commons"
              className="commons-module-link is-active"
              aria-label="Open Commons"
            >
              <div className="commons-module-icon" aria-hidden="true">⊕</div>
              <div className="commons-module-copy">
                <span className="commons-module-label">Commons</span>
                <span className="commons-module-desc">Field signals, opportunities, steward decisions.</span>
              </div>
            </a>
            <a
              href="/workspace/network/people"
              className="commons-module-link"
              aria-label="Open Network"
            >
              <div className="commons-module-icon" aria-hidden="true">∴</div>
              <div className="commons-module-copy">
                <span className="commons-module-label">Network</span>
                <span className="commons-module-desc">People, crews, institutions, capabilities.</span>
              </div>
            </a>
            <a
              href="/workspace/workbench"
              className="commons-module-link"
              aria-label="Open Workbench"
            >
              <div className="commons-module-icon" aria-hidden="true">▭</div>
              <div className="commons-module-copy">
                <span className="commons-module-label">Workbench</span>
                <span className="commons-module-desc">Pilot lanes and coordinated work.</span>
              </div>
            </a>
            <a
              href="/workspace/records/roll"
              className="commons-module-link"
              aria-label="Open Records"
            >
              <div className="commons-module-icon" aria-hidden="true">≡</div>
              <div className="commons-module-copy">
                <span className="commons-module-label">Records</span>
                <span className="commons-module-desc">Canon, Annals, and the Roll ledger.</span>
              </div>
            </a>
            <a
              href="/workspace/intelligence"
              className="commons-module-link"
              aria-label="Open Intelligence"
            >
              <div className="commons-module-icon" aria-hidden="true">⌘</div>
              <div className="commons-module-copy">
                <span className="commons-module-label">Intelligence</span>
                <span className="commons-module-desc">Trust and economic intelligence research.</span>
              </div>
            </a>
          </div>
        </section>

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

         {commonsView === 'decisions' && (
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
         )}

         {commonsView === 'opportunities' && (
           <CommonsOpportunities
             selectedOpportunityId={selectedOpportunityId}
             setSelectedOpportunityId={setSelectedOpportunityId}
           />
         )}

         {commonsView === 'signals' && (
           <section aria-label="Field signal workspace" className="signal-workspace">
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
               onOpenWorkbench={() => navigate('/workspace/workbench')}
               onOpenWorkBrief={proposalId => navigate(`/workspace/workbench?proposal=${encodeURIComponent(proposalId)}`)}
               onSetCommonsView={setCommonsView}
               onAddNote={addNote}
               note={note}
               setNote={setNote}
             />
           </section>
         )}
       </div>
     </WorkspaceLayout>
   );
}
