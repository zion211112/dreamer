'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CircleAlert, Plus, Send, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyToOpportunity, publishOpportunity, reviewOpportunityApplication } from '../../app/commons/opportunities/actions';
import type { CommonsApplication, CommonsOpportunity } from '@/lib/opportunities';
import type { Tender } from '@/lib/tender';

const scenarioOpportunities = [
  {
    title: 'Embedded systems builder',
    asset: 'Solar kitchen kit',
    skills: ['Firmware', 'Power systems', 'Field testing'],
    description: 'Help design a repairable temperature controller and document the test plan for a school kitchen build.',
  },
  {
    title: 'Fabrication lead',
    asset: 'Community radio studio',
    skills: ['Metalwork', 'Acoustics', 'Mentorship'],
    description: 'Shape the modular booth frame and mentor a local apprentice through the first assembly.',
  },
];

export function OpportunityBoard({
  applications,
  assets,
  authenticated,
  canPublish,
  guest,
  opportunities,
  configured,
  loadError,
}: {
  applications: CommonsApplication[];
  assets: Tender[];
  authenticated: boolean;
  canPublish: boolean;
  guest: boolean;
  opportunities: CommonsOpportunity[];
  configured: boolean;
  loadError: string | null;
}) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeApply, setActiveApply] = useState('');
  const [note, setNote] = useState('');
  const [shareRollProfile, setShareRollProfile] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [assetId, setAssetId] = useState(assets[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function submitApplication(opportunityId: string) {
    setError('');
    startTransition(async () => {
      const result = await applyToOpportunity({ opportunityId, note, shareRollProfile });
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage('Application sent. The Asset issuer can review it alongside your Roll profile.');
      setActiveApply('');
      setNote('');
      setShareRollProfile(false);
    });
  }

  function submitOpportunity() {
    setError('');
    startTransition(async () => {
      const result = await publishOpportunity({ tenderId: assetId, roleTitle, description, skills });
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage('Opportunity published to the Commons.');
      setComposerOpen(false);
      setRoleTitle('');
      setDescription('');
      setSkills('');
    });
  }

  function review(applicationId: string, status: 'reviewed' | 'declined') {
    setError('');
    startTransition(async () => {
      const result = await reviewOpportunityApplication({ applicationId, status });
      if (result.error) setError(result.error);
      else setMessage(status === 'reviewed' ? 'Application marked for follow-up.' : 'Application declined.');
    });
  }

  return (
    <section className="opportunity-board" aria-labelledby="opportunities-title">
      <div className="opportunity-board-head">
        <div><p className="eyebrow">COMMONS / ASSET-LINKED WORK</p><h1 id="opportunities-title">Find your people.<br /><em>Put the work in motion.</em></h1><p>Specific roles attached to real Assets. Every application arrives with a Roll profile—earned proof or a clear first page.</p></div>
        {canPublish && assets.length > 0 && <Button className="button button-primary" onClick={() => setComposerOpen(value => !value)} type="button"><Plus aria-hidden="true" size={15} /> Post a role</Button>}
      </div>
      {loadError && <div className="opportunity-alert" role="alert"><CircleAlert aria-hidden="true" size={15} />{loadError}</div>}
      {error && <div className="opportunity-alert" role="alert"><CircleAlert aria-hidden="true" size={15} />{error}</div>}
      {message && <div className="opportunity-success" role="status"><BadgeCheck aria-hidden="true" size={15} />{message}</div>}

      {composerOpen && (
        <div className="opportunity-composer">
          <div className="opportunity-form-heading"><div><p className="eyebrow">ISSUER DESK / NEW ROLE</p><h2>Who does this Asset need?</h2></div><button aria-label="Close role form" className="icon-button" onClick={() => setComposerOpen(false)} type="button"><X size={16} /></button></div>
          <label>Asset
            <select onChange={event => setAssetId(event.target.value)} value={assetId}>{assets.map(asset => <option key={asset.id} value={asset.id}>{asset.assetName}</option>)}</select>
          </label>
          <label>Role title<input maxLength={120} onChange={event => setRoleTitle(event.target.value)} value={roleTitle} /></label>
          <label>What needs doing?<textarea maxLength={3000} minLength={20} onChange={event => setDescription(event.target.value)} rows={4} value={description} /></label>
          <label>Skills, separated by commas<input maxLength={480} onChange={event => setSkills(event.target.value)} placeholder="Firmware, field testing, repair" value={skills} /></label>
          <Button className="button button-primary" disabled={pending || !assetId} onClick={submitOpportunity} type="button">{pending ? 'Publishing…' : 'Publish role'} <ArrowRight aria-hidden="true" size={14} /></Button>
          <p>Only an authorized issuer for the selected Asset can publish. Student and Console records are never attached.</p>
        </div>
      )}

      {opportunities.length > 0 ? (
        <div className="opportunity-list">
          {opportunities.map(opportunity => (
            <article className="opportunity-card" key={opportunity.id}>
              <div className="opportunity-card-meta"><span><BriefcaseBusiness aria-hidden="true" size={13} /> COMMONS OPPORTUNITY</span><Link href={`/tenders/${opportunity.asset_slug}${guest ? '?mode=guest' : ''}`}>{opportunity.asset_name} <ArrowRight aria-hidden="true" size={12} /></Link></div>
              <h2>{opportunity.role_title}</h2>
              <p>{opportunity.description}</p>
              <div className="opportunity-skills">{opportunity.skill_tags.map(skill => <span key={skill}>{skill}</span>)}</div>
              <div className="opportunity-card-footer"><span>{opportunity.application_count} {opportunity.application_count === 1 ? 'application' : 'applications'}</span>
                {authenticated
                  ? <Button className="button button-outline button-small" onClick={() => { setActiveApply(activeApply === opportunity.id ? '' : opportunity.id); setError(''); }} type="button">Apply with Roll profile <ArrowRight aria-hidden="true" size={13} /></Button>
                  : <Link className="button button-outline button-small" href={`/sign-in?next=${encodeURIComponent('/commons/opportunities')}`}>Sign in to apply <ArrowRight aria-hidden="true" size={13} /></Link>}
              </div>
              {activeApply === opportunity.id && <div className="opportunity-apply-form"><label>Short introduction<textarea maxLength={2000} minLength={20} onChange={event => setNote(event.target.value)} placeholder="Tell the Asset team what you can build or want to learn." rows={3} value={note} /></label><label className="roll-share-consent"><input checked={shareRollProfile} onChange={event => setShareRollProfile(event.target.checked)} type="checkbox" /><span>Share my Roll profile, earned badges and display name with this Asset’s authorized issuer for this application. This does not make my profile public.</span></label><p>No previous badge is required. Your application is private to you and the authorized issuer.</p><Button className="button button-primary button-small" disabled={pending || !shareRollProfile} onClick={() => submitApplication(opportunity.id)} type="button"><Send aria-hidden="true" size={13} /> {pending ? 'Sending…' : 'Send application'}</Button></div>}
              {applications.filter(application => application.opportunity_id === opportunity.id).map(application => (
                <div className={`opportunity-application ${application.isOwn ? 'opportunity-application-own' : ''}`} key={application.id}>
                  <div className="application-profile">
                    <strong>{application.applicantName}</strong>
                    {application.profileIsPublic
                      ? <Link href={`/roll/profile/${application.applicant_id}`}>{application.rank} · {application.deployedAssetCount} deployed · {application.capabilityBadgeCount} badges <ArrowRight aria-hidden="true" size={12} /></Link>
                      : <span>{application.rank} · {application.deployedAssetCount} deployed · {application.capabilityBadgeCount} badges · shared privately</span>}
                  </div>
                  <p>{application.note}</p>
                  {application.capabilityBadges.length > 0
                    ? <ul className="application-proof-list" aria-label="Shared Roll capability badges">{application.capabilityBadges.map((badge, index) => <li key={`${application.id}-${index}`}><BadgeCheck aria-hidden="true" size={13} /><span>{badge.asset_name} · {badge.role} · <code>{badge.blueprint_hash.slice(0, 12)}…</code></span></li>)}</ul>
                    : <p className="application-proof-empty">No deployed Capability Badge yet. First-build applicants are welcome.</p>}
                  {!application.isOwn && <div className="application-review"><span>{application.status}</span><Button className="button button-outline button-small" disabled={pending} onClick={() => review(application.id, 'reviewed')} type="button">Mark for follow-up</Button><Button className="button button-outline button-small" disabled={pending} onClick={() => review(application.id, 'declined')} type="button">Decline</Button></div>}
                </div>
              ))}
            </article>
          ))}
        </div>
      ) : (
        <div className="opportunity-empty">
          <p className="eyebrow">{configured ? 'NO OPEN ROLES' : 'DEMO SCENARIOS · NOT LIVE OPPORTUNITIES'}</p>
          <h2>{configured ? 'No open opportunity is posted yet.' : 'A glimpse of how teams could form.'}</h2>
          <p>{configured ? 'When an authorized Asset issuer posts a role, it appears here. We do not turn examples into live work.' : 'These sample roles illustrate an Asset-linked Commons. They are not openings and cannot receive applications.'}</p>
          {!configured && <div className="opportunity-scenarios">{scenarioOpportunities.map(item => <article key={item.title}><span>DEMO SCENARIO</span><h3>{item.title}</h3><small>{item.asset}</small><p>{item.description}</p><div className="opportunity-skills">{item.skills.map(skill => <span key={skill}>{skill}</span>)}</div></article>)}</div>}
          {!configured && <p className="opportunity-boundary"><ShieldCheck aria-hidden="true" size={14} />No network service configured. Demo entries are read-only and stored nowhere.</p>}
        </div>
      )}
      {configured && canPublish && assets.length === 0 && <p className="opportunity-boundary">No eligible published Asset is available for role creation.</p>}
    </section>
  );
}
