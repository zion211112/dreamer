import { useState } from 'preact/hooks';
import { PeopleDirectory } from '../../components/people/PeopleDirectory';
import { EntityInspector } from '../../components/people/EntityInspector';
import {
  PEOPLE_NETWORK,
  PEOPLE_RELATIONSHIPS,
  type NetworkEntity,
} from '../../lib/people-network';
import { WorkspaceLayout } from './WorkspaceLayout';
import { projectPeopleDirectoryEntries, type PeopleDirectoryEntry } from '../../lib/people-discovery';

const BRAND_MARK = (
  <svg className="people-brand-mark" viewBox="0 0 32 32" aria-hidden="true">
    <path
      d="M16 2 C9.373 2 4 7.373 4 14 C4 16.972 6.148 19.483 9.172 21.086 L9.172 21.086 C10.775 22.031 12.793 22 14.5 22 C16.207 22 18.225 22.031 19.828 21.086 L19.828 21.086 C22.852 19.483 25 16.972 25 14 C25 7.373 19.627 2 16 2 Z M16 20 C14.343 20 13 18.657 13 17 C13 15.343 14.343 14 16 14 C17.657 14 19 15.343 19 17 C19 18.657 17.657 20 16 20 Z"
      fill="#1b1f1a"
    />
  </svg>
);

export function People() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<NetworkEntity | null>(null);

  const entries = projectPeopleDirectoryEntries(PEOPLE_NETWORK, PEOPLE_RELATIONSHIPS, []);
  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLocaleLowerCase();
    return (
      entry.entity.name.toLocaleLowerCase().includes(q) ||
      entry.entity.role.toLocaleLowerCase().includes(q) ||
      entry.claims.some((claim) => claim.name.toLocaleLowerCase().includes(q)) ||
      entry.offers.some((offer) => offer.title.toLocaleLowerCase().includes(q))
    );
  });

  function handleEntitySelect(entry: PeopleDirectoryEntry | null) {
    setSelectedEntity(entry ? entry.entity : null);
  }

  return (
    <WorkspaceLayout currentContext="network:people">
      <div className="people-page">
      <header className="people-page-header">
        <div className="people-brand">{BRAND_MARK}<span className="people-brand-name">APT-LABS</span></div>
        <div className="people-page-title">
          <h1>People</h1>
          <span className="people-page-divider" aria-hidden="true">/</span>
          <span className="people-page-caption">Capability directory · network map</span>
        </div>
        <div className="people-page-actions">
          <button className="people-btn people-btn--primary" type="button">＋ Add person</button>
          <button className="people-btn" type="button">Export record</button>
        </div>
      </header>

      <div className="people-meta">
        <span className="people-dot" aria-hidden="true"></span>
        <span>CAPABILITY DIRECTORY</span>
        <span>·</span>
        <span>{entries.length} RECORDS</span>
        <span>·</span>
        <span>{PEOPLE_RELATIONSHIPS.length} RELATIONSHIPS</span>
      </div>

      <div className="people-workbench">
        <section className="people-directory-panel">
          <PeopleDirectory
            entries={filteredEntries}
            entityType="person"
            query={searchQuery}
            selectedId={selectedEntity?.id ?? null}
            onQueryChange={setSearchQuery}
            onSelect={handleEntitySelect}
          />
        </section>

        <aside className="people-inspector-panel">
          {selectedEntity ? (
            <EntityInspector
              entity={selectedEntity}
              directoryEntry={undefined}
              profiles={[]}
              profileOwnerId=""
              profileStoreReady={true}
              evidenceRecords={[]}
              mobileOpen={false}
              entities={PEOPLE_NETWORK}
              relationships={PEOPLE_RELATIONSHIPS}
              recordScope="sample"
              onSelect={(entity: NetworkEntity) => setSelectedEntity(entity)}
              onClose={() => handleEntitySelect(null)}
              onSaveProfile={() => {}}
            />
          ) : (
            <div className="people-empty">Select a person or crew to inspect</div>
          )}
        </aside>
      </div>
      </div>
    </WorkspaceLayout>
  );
}
