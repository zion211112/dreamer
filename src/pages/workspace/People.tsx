import { useEffect, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { EntityInspector } from '../../components/people/EntityInspector';
import { NetworkMap } from '../../components/people/NetworkMap';
import { PeopleDirectory } from '../../components/people/PeopleDirectory';
import {
  importPortablePeopleRecord,
  isPrimaryEntity,
  PEOPLE_NETWORK,
  PEOPLE_RELATIONSHIPS,
  readImportedPeopleNetworkRecord,
  ROOT_ENTITY_BY_TYPE,
  type NetworkEntity,
  type PeopleNetworkRecord,
} from '../../lib/people-network';
import { projectPeopleDirectoryEntries } from '../../lib/people-discovery';
import {
  readPeopleProfileOwnerId,
  readPeopleProfiles,
  savePeopleProfiles,
  type PeopleProfileRecord,
} from '../../lib/people-profiles';
import { WorkspaceLayout } from './WorkspaceLayout';

type PeopleView = 'people' | 'crews' | 'network';

export function People() {
  const sampleRecord: PeopleNetworkRecord = { entities: PEOPLE_NETWORK, relationships: PEOPLE_RELATIONSHIPS };
  const [importedRecord, setImportedRecord] = useState<PeopleNetworkRecord | null>(null);
  const [profiles, setProfiles] = useState<PeopleProfileRecord[]>([]);
  const [profileOwnerId, setProfileOwnerId] = useState('');
  const [profileStoreReady, setProfileStoreReady] = useState(false);
  const [activeDataset, setActiveDataset] = useState<'sample' | 'imported'>('sample');
  const [activeView, setActiveView] = useState<PeopleView>('people');
  const [rootId, setRootId] = useState(ROOT_ENTITY_BY_TYPE.person);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [recordStatus, setRecordStatus] = useState('');
  const importInput = useRef<HTMLInputElement>(null);
  const networkRecord = activeDataset === 'imported' && importedRecord ? importedRecord : sampleRecord;
  const entityById = new Map(networkRecord.entities.map(entity => [entity.id, entity]));
  const selectedEntity = selectedId ? entityById.get(selectedId) ?? null : null;
  const importedEntityIds = new Set(networkRecord.entities.map(entity => entity.id));
  const profilesForActiveDataset = activeDataset === 'imported'
    ? profiles.filter(profile => profile.origin !== 'user-authored'
      || profile.ownerId === profileOwnerId
        && profile.subjectId === profile.sourceRecordId
        && Boolean(profile.sourceRecordId)
        && importedEntityIds.has(profile.sourceRecordId ?? ''))
    : [];
  const directoryEntries = projectPeopleDirectoryEntries(
    networkRecord.entities,
    networkRecord.relationships,
    profilesForActiveDataset,
  );

  useEffect(() => {
    try {
      setImportedRecord(readImportedPeopleNetworkRecord());
    } catch (error) {
      setRecordStatus(error instanceof Error ? error.message : 'Saved People record could not be read.');
    }
    try {
      setProfiles(readPeopleProfiles());
      setProfileStoreReady(true);
    } catch (error) {
      setProfileStoreReady(false);
      setRecordStatus(error instanceof Error ? error.message : 'Saved local People profiles could not be read.');
    }
    try {
      setProfileOwnerId(readPeopleProfileOwnerId());
    } catch (error) {
      setRecordStatus(error instanceof Error ? error.message : 'Browser-local demo identity could not be read.');
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImport = async (event: Event) => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      importPortablePeopleRecord(await file.text());
      const imported = readImportedPeopleNetworkRecord();
      if (!imported) throw new Error('The imported People record could not be read after import.');
      setImportedRecord(imported);
      setActiveDataset('imported');
      setActiveView('people');
      const firstPerson = imported.entities.find(entity => entity.type === 'person');
      setRootId(firstPerson?.id ?? '');
      setSelectedId(null);
      setRecordStatus('Portable record imported locally.');
    } catch (error) {
      setRecordStatus(error instanceof Error ? error.message : 'Record could not be imported.');
    } finally {
      input.value = '';
    }
  };

  const chooseEntity = (entity: NetworkEntity) => {
    if (!isPrimaryEntity(entity)) return;
    setRootId(entity.id);
    setSelectedId(entity.id);
  };

  const selectDataset = (dataset: 'sample' | 'imported') => {
    if (dataset === 'imported' && !importedRecord) return;
    const nextRecord = dataset === 'sample' ? sampleRecord : importedRecord;
    if (!nextRecord) return;
    const firstPerson = nextRecord.entities.find(entity => entity.type === 'person');
    setActiveDataset(dataset);
    setActiveView('people');
    setRootId(firstPerson?.id ?? '');
    setSelectedId(null);
    setQuery('');
  };

  const saveProfile = (profile: PeopleProfileRecord) => {
    const importedSubject = importedRecord?.entities.find(entity => (
      entity.id === profile.subjectId && (entity.type === 'person' || entity.type === 'crew')
    ));
    if (activeDataset !== 'imported'
      || !importedSubject
      || !profileOwnerId
      || profile.origin !== 'user-authored'
      || profile.ownerId !== profileOwnerId
      || profile.sourceRecordId !== importedSubject.id) {
      throw new Error('This local revision is not linked to an imported person or crew you can edit.');
    }
    if (!profileStoreReady) throw new Error('Local People profile storage is unavailable; the revision was not saved.');

    const nextProfiles = profiles
      .filter(record => record.id !== profile.id && !(
        record.origin === 'user-authored'
        && record.ownerId === profileOwnerId
        && record.sourceRecordId === profile.sourceRecordId
      ))
      .concat(profile);
    try {
      savePeopleProfiles(nextProfiles);
    } catch (error) {
      setRecordStatus(error instanceof Error ? error.message : 'Local People profile could not be saved.');
      throw error;
    }
    setProfiles(nextProfiles);
    setRecordStatus('Saved as a browser-local revision. Not published.');
  };

  return (
    <WorkspaceLayout currentContext="network:people">
      <div className="people-page">
        <header className="people-page-header">
          <div className="people-page-title">
            <h1>People</h1>
            <span className="people-page-divider" aria-hidden="true">/</span>
            <span className="people-page-caption">Find capability, services, and collaborators</span>
          </div>
          <div className="people-page-status">
            <span className="people-page-status-dot" />
            {activeDataset === 'sample' ? 'Shared examples · not live records' : 'Imported portable record'}
            <div aria-label="People dataset" className="people-dataset-switch" role="group">
              <button
                aria-pressed={activeDataset === 'sample'}
                className={activeDataset === 'sample' ? 'is-active' : ''}
                onClick={() => selectDataset('sample')}
                type="button"
              >
                Shared sample
              </button>
              <button
                aria-pressed={activeDataset === 'imported'}
                className={activeDataset === 'imported' ? 'is-active' : ''}
                disabled={!importedRecord}
                onClick={() => selectDataset('imported')}
                type="button"
              >
                Imported record
              </button>
            </div>
            <input
              ref={importInput}
              accept="application/json"
              aria-label="Import portable People record"
              className="people-import-input"
              onChange={event => void handleImport(event)}
              type="file"
            />
            <button className="people-import-trigger" onClick={() => importInput.current?.click()} type="button">
              Import record
            </button>
          </div>
        </header>
        <p className="people-capability-shortcut">
          <span>Looking for a capability directory?</span>
          <Link href="/workspace/institutions/network">Browse capabilities <span aria-hidden="true">→</span></Link>
        </p>

        <nav className="people-view-tabs" aria-label="People views" role="tablist">
          {([
            ['people', 'People'],
            ['crews', 'Crews'],
            ['network', 'Network'],
          ] as const).map(([view, label]) => (
            <button
              key={view}
              id={`people-tab-${view}`}
              type="button"
              role="tab"
              aria-selected={activeView === view}
              aria-controls={`people-panel-${view}`}
              tabIndex={activeView === view ? 0 : -1}
              className={activeView === view ? 'is-active' : ''}
              onClick={() => setActiveView(view)}
              onKeyDown={event => {
                const views: PeopleView[] = ['people', 'crews', 'network'];
                const currentIndex = views.indexOf(view);
                const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % views.length
                  : event.key === 'ArrowLeft' ? (currentIndex + views.length - 1) % views.length
                    : event.key === 'Home' ? 0
                      : event.key === 'End' ? views.length - 1 : -1;
                if (nextIndex < 0) return;
                event.preventDefault();
                const nextView = views[nextIndex];
                setActiveView(nextView);
                document.getElementById(`people-tab-${nextView}`)?.focus();
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        <section className="people-workbench" aria-label="People capability directory and network">
          <div
            id="people-panel-people"
            className="people-directory-panel"
            role="tabpanel"
            aria-labelledby="people-tab-people"
            hidden={activeView !== 'people'}
          >
            <PeopleDirectory
              entries={directoryEntries}
              entityType="person"
              query={query}
              selectedId={selectedEntity?.id ?? null}
              onQueryChange={setQuery}
              onSelect={entry => chooseEntity(entry.entity)}
            />
          </div>
          <div
            id="people-panel-crews"
            className="people-directory-panel"
            role="tabpanel"
            aria-labelledby="people-tab-crews"
            hidden={activeView !== 'crews'}
          >
            <PeopleDirectory
              entries={directoryEntries}
              entityType="crew"
              query={query}
              selectedId={selectedEntity?.id ?? null}
              onQueryChange={setQuery}
              onSelect={entry => chooseEntity(entry.entity)}
            />
          </div>
          <div
            id="people-panel-network"
            className="people-network-panel"
            role="tabpanel"
            aria-labelledby="people-tab-network"
            hidden={activeView !== 'network'}
          >
            <NetworkMap
              rootId={rootId}
              selectedId={selectedEntity?.id ?? ''}
              query={query}
              entities={networkRecord.entities}
              relationships={networkRecord.relationships}
              onSelect={chooseEntity}
            />
          </div>
          <EntityInspector
            entity={selectedEntity}
            directoryEntry={directoryEntries.find(entry => entry.entity.id === selectedEntity?.id)}
            profiles={profilesForActiveDataset}
            profileOwnerId={profileOwnerId}
            profileStoreReady={profileStoreReady}
            mobileOpen={selectedEntity !== null}
            entities={networkRecord.entities}
            relationships={networkRecord.relationships}
            recordScope={activeDataset}
            onSelect={chooseEntity}
            onClose={() => setSelectedId(null)}
            onSaveProfile={saveProfile}
          />
        </section>
        {recordStatus && <p className="people-record-status" role="status">{recordStatus}</p>}
      </div>
    </WorkspaceLayout>
  );
}
