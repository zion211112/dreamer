import sys

path = sys.argv[1]
with open(path, 'r') as f:
    content = f.read()

old_block = '''          <div className="workbench-sim-dossier">
            {!simulation ? (
              <>
                <SchoolNeedSourcePicker
                  drafts={sourceDrafts}
                  onSelect={chooseDraft}
                  selectedId={selectedDraftId}
                />
                {source && (
                  <>
                    <section aria-labelledby="workbench-sim-context-title" className="workbench-sim-context">
                      <p className="workbench-sim-kicker">LINKED CONTEXT / SELECT BY RECORD</p>
                      <h2 id="workbench-sim-context-title">Institution, observation, asset</h2>
                      <div className="workbench-sim-form-grid">
                        <label>Institution <span>(context, not authority)</span>
                          <select onChange={event => updateContext('institutionId', (event.currentTarget as HTMLSelectElement).value)} value={context.institutionId ?? ''}>
                            <option value="">Select a registered institution</option>
                            {institutions.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                          </select>
                        </label>
                        <label>Commons observation <span>(optional · select by record)</span>
                          <select onChange={event => updateContext('commonsSignalId', (event.currentTarget as HTMLSelectElement).value)} value={context.commonsSignalId ?? ''}>
                            <option value="">No Commons observation</option>
                            {eligibleSignals.map(signal => <option key={signal.id} value={signal.id}>{signal.title}</option>)}
                          </select>
                        </label>
                        <label className="workbench-sim-field-wide">Registered asset <span>(optional · no inference)</span>
                          <select onChange={event => updateContext('assetRecordId', (event.currentTarget as HTMLSelectElement).value)} value={context.assetRecordId ?? ''}>
                            <option value="">Asset not identified</option>
                            {assets.map(entity => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
                          </select>
                        </label>
                      </div>
                    </section>
                    {plan && (
                      <TenderCandidateForm
                        context={contextLabels}
                        onChange={setPlan}
                        onStart={startSimulation}
                        plan={plan}
                        source={source}
                      />
                    )}
                  </>
                )}
              </>
            ) : (
              <>
                <section aria-labelledby="workbench-sim-case-title" className="workbench-sim-case">
                  <div className="workbench-sim-case-head">
                    <div><p className="workbench-sim-kicker">SOURCE / CONSOLE DRAFT {simulation.source.consoleDraftId}</p><h2 id="workbench-sim-case-title">{simulation.source.assetName}</h2></div>
                    <span className="workbench-sim-status">{simulation.status.replace('_', ' ')}</span>
                  </div>
                  <p>{simulation.source.need}</p>
                  <dl>
                    <div><dt>Institution</dt><dd>
                      {contextLabel(simulation.source.institutionId, institutionsById, 'institution')}
                      {simulation.source.institutionId && institutionsById.has(simulation.source.institutionId) && (
                        <Link href={`/workspace/institutions?record=${encodeURIComponent(simulation.source.institutionId)}#institution-record-${encodeURIComponent(simulation.source.institutionId)}`}>Open record</Link>
                      )}
                    </dd></div>
                    <div><dt>Commons</dt><dd>
                      {signalContextLabel(simulation.source.commonsSignalId, signals)}
                      {linkedSignalRecord && simulation.source.commonsSignalId === linkedSignalRecord.id && (
                        <Link href={`/workspace/commons?institution=${encodeURIComponent(linkedSignalRecord.institutionId)}&signal=${encodeURIComponent(linkedSignalRecord.id)}`}>Open record</Link>
                      )}
                    </dd></div>
                    <div><dt>Asset</dt><dd>
                      {contextLabel(simulation.source.assetRecordId, assetsById, 'asset')}
                      {simulation.source.assetRecordId && assetsById.has(simulation.source.assetRecordId) && (
                        <Link href={`/workspace/institutions?record=${encodeURIComponent(simulation.source.assetRecordId)}#institution-record-${encodeURIComponent(simulation.source.assetRecordId)}`}>Open record</Link>
                      )}
                    </dd></div>
                    <div><dt>Source estimate</dt><dd>{simulation.source.assetBuildCost === null ? 'Not supplied' : `KES ${simulation.source.assetBuildCost}`}</dd></div>
                  </dl>
                </section>

                {simulation.stage === 'assembly_simulated' && <PackageComposition plan={simulation.plan} />}
                {simulation.stage !== 'candidate_drafted' && (
                  <section className="workbench-sim-scope">
                    <p className="workbench-sim-kicker">TENDER CANDIDATE / MANUAL</p>
                    <h2>{simulation.plan.scope}</h2>
                    <p>{simulation.plan.workKind === 'physical-asset' ? 'Physical asset work · Roll preview may apply after acceptance.' : 'Non-physical work · ends at accepted-work evidence.'}</p>
                  </section>
                )}
                {simulation.rollPreview && (
                  <section aria-labelledby="workbench-sim-roll-title" className="workbench-sim-roll">
                    <p className="workbench-sim-kicker">ROLL PREVIEW / SIMULATED ONLY</p>
                    <h2 id="workbench-sim-roll-title">{simulation.rollPreview.assetName}</h2>
                    <p>{simulation.rollPreview.scope}</p>
                    <dl>
                      <div><dt>Scenario roles</dt><dd>{simulation.rollPreview.simulatedRoles.join(' · ') || 'None specified'}</dd></div>
                      <div><dt>Scenario evidence</dt><dd>{simulation.rollPreview.evidence.join(' · ') || 'No evidence'}</dd></div>
                      <div><dt>Recorded</dt><dd>{new Date(simulation.rollPreview.simulatedAt).toLocaleString()}</dd></div>
                    </dl>
                  </section>
                )}
                <SimulationRunControls
                  onAdvance={advance}
                  onCancel={note => advance({ type: 'cancel', note })}
                  onDiscard={discardSimulation}
                  onPause={() => advance({ type: 'pause' })}
                  onRestart={restartSimulation}
                  onResume={() => advance({ type: 'resume' })}
                  simulation={simulation}
                />
                <SimulationTrace events={simulation.events} planSource={simulation.planSource} />
              </>
            )}
          </div>'''

new_block = '''          <div className="workbench-sim-dossier">
            {!simulation ? (
              <WorkbenchDossier
                sourceDrafts={sourceDrafts}
                selectedDraftId={selectedDraftId}
                chooseDraft={chooseDraft}
                source={source}
                context={context}
                updateContext={updateContext}
                eligibleSignals={eligibleSignals}
                institutions={institutions}
                assets={assets}
                plan={plan}
                setPlan={setPlan}
                startSimulation={startSimulation}
                contextLabels={contextLabels}
              />
            ) : (
              <WorkbenchCaseView
                simulation={simulation}
                institutionsById={institutionsById}
                assetsById={assetsById}
                signals={signals}
                linkedSignalRecord={linkedSignalRecord}
                advance={advance}
                discardSimulation={discardSimulation}
                restartSimulation={restartSimulation}
              />
            )}
          </div>'''

if old_block not in content:
    print('OLD BLOCK NOT FOUND')
    idx = content.find('<div className="workbench-sim-dossier"')
    print('div found at', idx)
    print(repr(content[idx:idx+60]))
    sys.exit(1)

content = content.replace(old_block, new_block, 1)
with open(path, 'w') as f:
    f.write(content)
print('REPLACED OK')
