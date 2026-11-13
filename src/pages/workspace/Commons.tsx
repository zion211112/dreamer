import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { CommonsReportForm } from './commons/ReportForm';
import { CommonsSignalQueue } from './commons/CommonsSignalQueue';
import { CommonsSignalDetail } from './commons/CommonsSignalDetail';
import { CommonsGovernance } from './commons/GovernancePanel';
import { CommonsOpportunities } from './commons/OpportunitiesPanel';
import { useCommons } from './commons/useCommons';
import { CommonsArrival } from './commons/CommonsArrival';
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
       {commonsView === 'arrival' ? (
         <CommonsArrival
           onExplore={(query: string) => {
             setSearch(query);
             setCommonsView('signals');
           }}
           onOpenPath={(id: string) => {
             if (id === 'share') {
               setShowContributionMenu(true);
             } else {
               setCommonsView('signals');
             }
           }}
         />
       ) : (
         <div className="signal-desk">
         <div className="signal-desk-head">
           <PageHead
             eyebrow="Commons"
             title="Signals and decisions"
             subtitle="Capture local observations, review opportunities, and record steward decisions."
           />
           <div className="signal-head-actions">
             <div className="commons-contribute">
               <Button
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
               </Button>
               {showContributionMenu && (
                 <div aria-label="Contribution options" className="commons-contribute-menu" role="group">
                   <Button
                     onClick={() => {
                       setShowContributionMenu(false);
                       setShowReportForm(true);
                     }}
                     type="button"
                   >
                     Add a signal
                   </Button>
                   <Button
                     onClick={() => {
                       setShowContributionMenu(false);
                       setCommonsView('opportunities');
                     }}
                     type="button"
                   >
                     Explore opportunities
                   </Button>
                 </div>
               )}
             </div>
           </div>
         </div>

         <nav className="commons-modebar" aria-label="Commons views">
           <Button
             aria-pressed={commonsView === 'signals'}
             className={commonsView === 'signals' ? 'is-active' : ''}
             onClick={() => setCommonsView('signals')}
             type="button"
           >
             Signals <span>{visibleSignals.length.toString().padStart(2, '0')}</span>
           </Button>
           <Button
             aria-pressed={commonsView === 'opportunities'}
             className={commonsView === 'opportunities' ? 'is-active' : ''}
             onClick={() => setCommonsView('opportunities')}
             type="button"
           >
             Opportunities
           </Button>
           <Button
             aria-pressed={commonsView === 'decisions'}
             className={commonsView === 'decisions' ? 'is-active' : ''}
             onClick={() => setCommonsView('decisions')}
             type="button"
           >
             Decisions <span>{governance.proposals.length.toString().padStart(2, '0')}</span>
           </Button>
          <label className="commons-scope-select" hidden={commonsView === 'opportunities'}>
            <span className="visually-hidden">Institution scope</span>
            <Select
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
            </Select>
          </label>
          <span className="commons-mode-hint">{scopeInstitutionName}</span>
         </nav>

        {error && <p className="local-data-warning" role="alert">{error}</p>}

        <section aria-labelledby="commons-modules-title" className="commons-modules-hub">
          <div className="commons-modules-head">
            <div>
              <p className="eyebrow">commons / modules</p>
              <h2 id="commons-modules-title">All modules</h2>
            </div>
          </div>
          <div className="commons-modules-grid">
            <a
              href="/workspace"
              className="commons-module-link"
              aria-label="Open workspace home"
            >
              <span className="commons-module-label">Workspace home</span>
              <span className="commons-module-desc">Your personal space and first steps.</span>
            </a>
            <a
              href="/workspace/commons"
              className="commons-module-link is-active"
              aria-label="Open Commons"
            >
              <span className="commons-module-label">Commons</span>
              <span className="commons-module-desc">Field signals, opportunities, steward decisions.</span>
            </a>
            <a
              href="/workspace/network/people"
              className="commons-module-link"
              aria-label="Open Network"
            >
              <span className="commons-module-label">Network</span>
              <span className="commons-module-desc">People, crews, institutions, capabilities.</span>
            </a>
            <a
              href="/workspace/workbench"
              className="commons-module-link"
              aria-label="Open Workbench"
            >
              <span className="commons-module-label">Workbench</span>
              <span className="commons-module-desc">Pilot lanes and coordinated work.</span>
            </a>
            <a
              href="/workspace/records/roll"
              className="commons-module-link"
              aria-label="Open Records"
            >
              <span className="commons-module-label">Records</span>
              <span className="commons-module-desc">Canon, Annals, and the Roll ledger.</span>
            </a>
            <a
              href="/workspace/intelligence"
              className="commons-module-link"
              aria-label="Open Intelligence"
            >
              <span className="commons-module-label">Intelligence</span>
              <span className="commons-module-desc">Trust and economic intelligence research.</span>
            </a>
            <a
              href="/workspace/kemetos1"
              className="commons-module-link"
              aria-label="Open Kemetos1 Coordinator"
            >
              <span className="commons-module-label">Kemetos1 Coordinator</span>
              <span className="commons-module-desc">Coordinate the Kemetos pilot: grasp essence, verify, route, attest.</span>
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
       )}
     </WorkspaceLayout>
   );
}
