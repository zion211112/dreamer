'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, BadgeCheck, Circle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { transitionAssembly } from '../../app/assembly/actions';
import type { TenderStatus } from '@/lib/tender';

const stages: Array<{ status: TenderStatus; title: string }> = [
  { status: 'materials', title: 'Materials' },
  { status: 'fabrication', title: 'Fabrication' },
  { status: 'anchor_signed', title: 'Anchor sign-off' },
  { status: 'deployed', title: 'Deployed' },
];

const statusIndex: Partial<Record<TenderStatus, number>> = {
  open: -1,
  materials: 0,
  fabrication: 1,
  anchor_signed: 2,
  deployed: 3,
};

export function AssemblyControls({
  tenderId,
  status,
  role,
  isIllustrative,
}: {
  tenderId: string;
  status: TenderStatus;
  role: string;
  isIllustrative: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const router = useRouter();
  const currentIndex = statusIndex[status] ?? -1;
  const nextStage = stages[currentIndex + 1];
  const allowed = Boolean(nextStage) && (
    nextStage.status === 'materials' ||
    (nextStage.status === 'fabrication' && ['anchor', 'builder'].includes(role)) ||
    (['anchor_signed', 'deployed'].includes(nextStage.status) && role === 'anchor')
  );

  function advance() {
    if (!nextStage) return;
    setError('');
    startTransition(async () => {
      const result = await transitionAssembly(tenderId, nextStage.status);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <ol className="assembly-stages">
        {stages.map((stage, index) => {
          const complete = index < currentIndex;
          const active = index === currentIndex + 1;
          return <li className={`${complete ? 'complete' : ''} ${active ? 'active' : ''}`} key={stage.status}>
            <span>{complete ? <BadgeCheck aria-hidden="true" size={15} /> : <Circle aria-hidden="true" size={9} />}</span>
            <div><small>0{index + 1}</small><strong>{stage.title}</strong></div>
          </li>;
        })}
      </ol>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {status === 'deployed'
        ? <p className="console-message"><BadgeCheck aria-hidden="true" size={15} /> Deployment recorded. The immutable Roll entry was created in the same database transaction.</p>
        : isIllustrative
          ? <p className="storage-warning"><Circle aria-hidden="true" size={14} /> Illustrative Tenders cannot be advanced in a real Assembly.</p>
          : allowed && nextStage
            ? <Button className="button button-primary" disabled={pending} onClick={advance} type="button">
              {pending ? <LoaderCircle aria-hidden="true" className="spinner" size={15} /> : null}
              {pending ? 'Recording transition…' : `Advance to ${nextStage.title}`}
              {!pending && <ArrowRight aria-hidden="true" size={15} />}
            </Button>
            : <p className="empty-inline">The next transition is reserved for the assigned {nextStage?.status === 'fabrication' ? 'Builder or Anchor' : 'Anchor'}.</p>}
    </>
  );
}
