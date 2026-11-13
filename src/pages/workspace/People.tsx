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
import { PageHead, type PageHeadMetric } from '../../components/PageHead';

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

  const metrics: PageHeadMetric[] = [
    { label: 'Records', value: entries.length, state: 'canon' },
    { label: 'Relationships', value: PEOPLE_RELATIONSHIPS.length, state: 'proposed' },
    { label: 'Lens', value: 'People + crews', state: 'caution' },
  ];

  return (
    <WorkspaceLayout currentContext="network:people">
      <div className="people-page">
        <PageHead
          eyebrow="Network"
          title="People & crews"
          subtitle="Understand who is in the network, what they offer, and how they connect."
          metrics={metrics}
        />

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
