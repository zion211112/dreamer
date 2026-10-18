import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, LockKeyhole, ShieldAlert } from 'lucide-react';
import { AssemblyControls } from '@/components/assembly-controls';
import { SiteHeader } from '@/components/site-header';
import { hasSupabaseConfiguration, createSupabaseServerClient } from '@/lib/supabase/server';
import { isTenderStatus } from '@/lib/tender';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function SetupRequired() {
  return <div className="assembly-gate"><ShieldAlert aria-hidden="true" size={19} /><p className="eyebrow">PRIVATE ASSEMBLY / NOT CONFIGURED</p><h1>Shared execution is unavailable.</h1><p>Configure Supabase Auth, Postgres and the tender migration before any crew or milestone data can be accessed. No local fixture is shown as a real Assembly.</p><Link className="text-link" href="/sign-in">Check sign-in setup <span aria-hidden="true">↗</span></Link></div>;
}

export default async function AssemblyPage({ params }: { params: Promise<{ tenderId: string }> }) {
  const { tenderId } = await params;
  if (!uuidPattern.test(tenderId)) notFound();
  if (!hasSupabaseConfiguration()) {
    return <main className="site-shell"><SiteHeader /><SetupRequired /><footer className="page-footer"><span>APT-LABS / PRIVATE ASSEMBLY</span><span>No Tender record was loaded.</span></footer></main>;
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(`Crew session could not be verified: ${authError.message}`);
  if (!authData.user) {
    return <main className="site-shell"><SiteHeader /><div className="assembly-gate"><LockKeyhole aria-hidden="true" size={19} /><p className="eyebrow">PRIVATE ASSEMBLY / SIGN-IN REQUIRED</p><h1>This build is crew-only.</h1><p>Sign in with the identity assigned to this Tender. Membership is checked on the server; a local role switch does not grant access.</p><Link className="button button-primary" href={`/sign-in?next=${encodeURIComponent(`/assembly/${tenderId}`)}`}>Sign in to continue <span aria-hidden="true">↗</span></Link></div><footer className="page-footer"><span>APT-LABS / PRIVATE ASSEMBLY</span><span>No Assembly record was loaded.</span></footer></main>;
  }

  const { data: crew, error: crewError } = await supabase
    .from('crew_members')
    .select('id,role')
    .eq('tender_id', tenderId)
    .eq('user_id', authData.user.id)
    .eq('is_active', true)
    .maybeSingle();
  if (crewError) throw new Error(`Crew authorization could not be checked: ${crewError.message}`);
  if (!crew) notFound();

  const { data: tender, error: tenderError } = await supabase
    .from('tenders')
    .select('id,asset_name,status,is_illustrative,active_blueprint_id')
    .eq('id', tenderId)
    .maybeSingle();
  if (tenderError) throw new Error(`Assembly Tender could not be loaded: ${tenderError.message}`);
  if (!tender) notFound();
  if (!isTenderStatus(tender.status)) {
    throw new Error('Assembly Tender has an unknown lifecycle status.');
  }
  if (!['anchor', 'builder', 'apprentice'].includes(crew.role)) {
    throw new Error('The assigned crew role is invalid.');
  }

  const { data: blueprint, error: blueprintError } = await supabase
    .from('blueprints')
    .select('version,content_hash,currency')
    .eq('id', tender.active_blueprint_id)
    .maybeSingle();
  if (blueprintError) throw new Error(`Active Blueprint could not be loaded: ${blueprintError.message}`);
  if (!blueprint) notFound();

  return (
    <main className="site-shell">
      <SiteHeader />
      <div className="detail-back"><Link href="/tenders"><ArrowLeft aria-hidden="true" size={14} /> Public Market</Link><span>CREW MEMBER / {crew.role.toUpperCase()}</span></div>
      <section className="assembly-page">
        <p className="eyebrow"><span className="signal-dot" /> Assigned crew only · authenticated session</p>
        <h1>{tender.asset_name}</h1>
        <p className="assembly-lede">A strict, attributable sequence. The application records a transition; this is not payment release, external certification or a cryptographic signature.</p>
        <div className="assembly-blueprint"><span>ACTIVE BLUEPRINT / VERSION {blueprint.version}</span><code>{blueprint.content_hash}</code><span>{blueprint.currency}</span></div>
        <div className="assembly-workflow">
          <AssemblyControls
            isIllustrative={tender.is_illustrative}
            role={crew.role}
            status={tender.status}
            tenderId={tender.id}
          />
        </div>
        <p className="fine-print">Every read and transition is subject to Supabase Auth, row-level security and the database crew check. A failed transition leaves both the Tender and Roll unchanged.</p>
      </section>
      <footer className="page-footer"><span>APT-LABS / PRIVATE ASSEMBLY</span><span>Current crew role: {crew.role}</span></footer>
    </main>
  );
}
