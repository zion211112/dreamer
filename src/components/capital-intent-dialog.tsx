'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { signalTenderCapital } from '../../app/tenders/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatMoney } from '@/lib/tender-data';

export function CapitalIntentDialog({
  tenderId,
  assetName,
  currency,
  targetAmountMinor,
  isIllustrative,
  authenticated,
  acceptingSignals,
}: {
  tenderId: string;
  assetName: string;
  currency: string;
  targetAmountMinor: number;
  isIllustrative: boolean;
  authenticated: boolean;
  acceptingSignals: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [intentId, setIntentId] = useState('');
  const [error, setError] = useState('');
  const [pending, startTransition] = useTransition();

  function submit() {
    setError('');
    startTransition(async () => {
      const result = await signalTenderCapital(tenderId, amount);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIntentId(result.intentId ?? '');
    });
  }

  return (
    <Dialog onOpenChange={open => {
      if (!open) {
        setAmount('');
        setIntentId('');
        setError('');
      }
    }}>
      <DialogTrigger asChild>
        <Button
          className="button button-primary"
          disabled={isIllustrative || !acceptingSignals}
          title={isIllustrative ? 'Scenario records cannot accept a live signal.' : undefined}
        >
          Signal Capital Intent <ArrowUpRight aria-hidden="true" size={15} />
        </Button>
      </DialogTrigger>
      <DialogContent className="intent-dialog capital-intent-dialog">
        <DialogHeader>
          <DialogTitle>Back a sovereign asset.</DialogTitle>
          <DialogDescription>
            {assetName} · Target {formatMoney(targetAmountMinor, currency)}
          </DialogDescription>
        </DialogHeader>
        {intentId ? (
          <div className="capital-intent-success" role="status">
            <Check aria-hidden="true" size={18} />
            <div><strong>Intent recorded on the Tender.</strong><span>Reference {intentId}. Offline settlement still requires verification by an authorized school or Tender issuer.</span></div>
          </div>
        ) : (
          <>
            <div className="capital-legal-disclosure">
              <p>This is a non-binding intent to fund. No funds are held or transferred by this platform. Your identity and intent amount will be recorded on the Tender ledger. APT-LABS will contact you to arrange offline settlement.</p>
              <p>Signaled intent is not paid capital, a guaranteed return, or an investment offer. Only an authorized issuer can verify offline settlement; that verification is required before the crew can begin.</p>
            </div>
            {authenticated ? (
              <>
                <label className="field-label" htmlFor="capital-intent-amount">Capital intent amount ({currency})
                  <input
                    autoComplete="off"
                    id="capital-intent-amount"
                    min="0.01"
                    onChange={event => setAmount(event.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={amount}
                  />
                </label>
                <Button className="button button-primary" disabled={pending || !amount} onClick={submit} type="button">
                  {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" size={15} /> : null}
                  {pending ? 'Recording signal…' : 'Record non-binding intent'}
                </Button>
              </>
            ) : (
              <Link className="button button-primary" href={`/sign-in?next=${encodeURIComponent(`/tenders/${tenderId}`)}`}>
                Sign in to signal capital <ArrowUpRight aria-hidden="true" size={14} />
              </Link>
            )}
            {isIllustrative && <p className="inline-error" role="status">Illustrative scenario: it cannot accept live capital signals.</p>}
            {error && <p className="inline-error" role="alert">{error}</p>}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
