import Link from 'next/link';
import { ArrowRight, ExternalLink, Search } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { getCommonsLibrary } from '@/lib/commons';

export const metadata = {
  title: 'Commons Library — APT-LABS',
  description: 'Source-linked public resources with attribution, license and revision records.',
};

export default async function CommonsLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; mode?: string }>;
}) {
  const [{ q = '', mode }, library] = await Promise.all([searchParams, getCommonsLibrary()]);
  const guest = mode === 'guest';
  const query = q.trim().toLocaleLowerCase();
  const resources = (library.data ?? []).filter(resource =>
    !query || [
      resource.title,
      resource.summary,
      resource.resource_kind,
      resource.attribution,
      resource.license_name,
      resource.revision,
    ].some(value => value.toLocaleLowerCase().includes(query))
  );

  return (
    <main className="site-shell commons-shell">
      <SiteHeader guest={guest} />
      <section className="commons-subhero">
        <p className="eyebrow">COMMONS / LIBRARY</p>
        <h1>References worth keeping.</h1>
        <p>Public links, not hosted files. Every record carries its source, attribution, declared license and revision so makers can inspect provenance before relying on it.</p>
        <Link className="text-link" href={guest ? '/commons?mode=guest' : '/commons'}>← Back to activity</Link>
      </section>
      <section className="commons-library-section">
        <form action="/commons/library" className="commons-search" role="search">
          <Search aria-hidden="true" size={16} />
          <label className="sr-only" htmlFor="commons-library-search">Search Commons resources</label>
          <input defaultValue={q} id="commons-library-search" name="q" placeholder="Search by title, type, license or source" />
          <button type="submit">Search</button>
        </form>
        {library.error && <div className="commons-alert" role="alert">{library.error}</div>}
        {!library.configured && (
          <div className="commons-empty">
            <h2>The Library is not connected yet.</h2>
            <p>Approved resource records appear here after the Commons migration is applied. No illustrative resource is presented as a live record.</p>
          </div>
        )}
        {library.configured && !library.error && resources.length === 0 && (
          <div className="commons-empty">
            <h2>{query ? 'No matching records.' : 'No published resources yet.'}</h2>
            <p>{query ? 'Try a different title, type or license term.' : 'The Library fills only with links reviewed by a human moderator.'}</p>
          </div>
        )}
        <div className="commons-library-list">
          {resources.map(resource => (
            <article className="commons-resource-card" key={resource.id}>
              <div className="commons-resource-topline"><span>{resource.resource_kind.toUpperCase()}</span><span>REV. {resource.revision}</span></div>
              <h2><Link href={`/commons/library/${resource.id}${guest ? '?mode=guest' : ''}`}>{resource.title}</Link></h2>
              <p>{resource.summary}</p>
              <div className="commons-resource-meta">
                <span><small>ATTRIBUTION</small>{resource.attribution}</span>
                <span><small>DECLARED LICENSE</small><a href={resource.license_url} rel="noopener noreferrer" target="_blank">{resource.license_name} <ExternalLink aria-hidden="true" size={11} /></a></span>
              </div>
              <div className="commons-resource-footer">
                <span>Source: <a href={resource.source_url} rel="noopener noreferrer" target="_blank">open original <ExternalLink aria-hidden="true" size={11} /></a></span>
                <Link href={`/commons/library/${resource.id}${guest ? '?mode=guest' : ''}`}>Inspect record <ArrowRight aria-hidden="true" size={13} /></Link>
              </div>
            </article>
          ))}
        </div>
        {library.configured && !library.error && library.data && library.data.length === 100 && (
          <p className="commons-list-limit">Showing the 100 most recently published resources. Refine your search to locate a record.</p>
        )}
      </section>
      <footer className="page-footer"><span>APT-LABS / LIBRARY</span><span>Source links are contributor-submitted and human-reviewed, not independently certified</span></footer>
    </main>
  );
}
