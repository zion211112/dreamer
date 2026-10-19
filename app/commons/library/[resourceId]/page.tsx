import Link from 'next/link';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { CommonsReportForm } from '@/components/commons-forms';
import { SiteHeader } from '@/components/site-header';
import { getCommonsIdentityState, getCommonsResource } from '@/lib/commons';

export async function generateMetadata({ params }: { params: Promise<{ resourceId: string }> }) {
  const { resourceId } = await params;
  const result = await getCommonsResource(resourceId);
  return { title: result.data ? `${result.data.title} — Commons Library` : 'Commons Library — APT-LABS' };
}

export default async function CommonsResourcePage({
  params,
}: {
  params: Promise<{ resourceId: string }>;
}) {
  const { resourceId } = await params;
  const [result, identity] = await Promise.all([
    getCommonsResource(resourceId),
    getCommonsIdentityState(),
  ]);
  if (!result.configured) {
    return (
      <main className="site-shell commons-shell">
        <SiteHeader />
        <div className="commons-alert">Commons is not connected here. This resource cannot be verified.</div>
      </main>
    );
  }
  if (result.error || !result.data) {
    return (
      <main className="site-shell commons-shell">
        <SiteHeader />
        <div className="commons-alert" role="alert">{result.error ?? 'Resource not found.'}</div>
        <Link className="text-link" href="/commons/library">Return to the Library</Link>
      </main>
    );
  }
  const resource = result.data;

  return (
    <main className="site-shell commons-shell">
      <SiteHeader />
      <article className="commons-detail">
        <Link className="commons-back-link" href="/commons/library">← Commons Library</Link>
        <p className="eyebrow">RESOURCE RECORD / {resource.resource_kind.toUpperCase()}</p>
        <h1>{resource.title}</h1>
        <p className="commons-detail-lede">{resource.summary}</p>
        <div className="commons-resource-ledger">
          <div><small>REVISION</small><strong>{resource.revision}</strong></div>
          <div><small>DECLARED LICENSE</small><strong>{resource.license_name}</strong><a href={resource.license_url} rel="noopener noreferrer" target="_blank">Inspect license <ArrowUpRight aria-hidden="true" size={13} /></a></div>
          <div><small>ATTRIBUTION</small><strong>{resource.attribution}</strong></div>
          <div><small>REVIEW STATUS</small><strong>Approved for public reference</strong></div>
        </div>
        <div className="commons-source-box">
          <span>ORIGINAL SOURCE</span>
          <a href={resource.source_url} rel="noopener noreferrer" target="_blank">{resource.source_url} <ArrowUpRight aria-hidden="true" size={14} /></a>
          <p>The source is an external link; APT-LABS does not host or deliver this file. Confirm rights and suitability with the original publisher before use.</p>
        </div>
        {resource.tender_id && (
          <div className="commons-related-tender">
            <span>RELATED WORK</span>
            <p>This record is associated with a published Tender.</p>
            <Link className="text-link" href="/tenders">Review the public Market <ArrowUpRight aria-hidden="true" size={13} /></Link>
          </div>
        )}
        {identity.error && <div className="commons-alert" role="alert">{identity.error}</div>}
        {identity.authenticated && !identity.error && (
          <section className="commons-detail-report">
            <div><ShieldCheck aria-hidden="true" size={15} /><span>Flag a provenance, rights or safety concern.</span></div>
            <CommonsReportForm targetId={resource.id} targetKind="resource" />
          </section>
        )}
      </article>
      <footer className="page-footer"><span>APT-LABS / RESOURCE RECORD</span><span>Submitted links and license claims are not independent certification</span></footer>
    </main>
  );
}
