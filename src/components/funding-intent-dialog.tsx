'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Tender } from '@/lib/tender';
import { formatMoney } from '@/lib/tender-data';

export function FundingIntentDialog({ tender }: { tender: Tender }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const quoteLabel = tender.isIllustrative ? 'illustrative asset build cost' : 'asset build cost';
  const note = `I would like to discuss the ${tender.assetName} Tender (${tender.slug}). The ${quoteLabel} is ${formatMoney(tender.assetBuildCostMinor, tender.currency)}. This is an enquiry only, not a pledge or payment.`;

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(note);
      setCopied(true);
      setError('');
    } catch {
      setError('Clipboard access was blocked. Select and copy the note below.');
    }
  }

  return (
    <Dialog onOpenChange={open => { if (!open) { setCopied(false); setError(''); } }}>
      <DialogTrigger asChild>
        <Button className="button button-primary">Discuss this Tender <ArrowUpRight aria-hidden="true" size={16} /></Button>
      </DialogTrigger>
      <DialogContent className="intent-dialog">
        <DialogHeader>
          <DialogTitle>Start a funding conversation</DialogTitle>
          <DialogDescription>
            APT-LABS does not collect pledges or move money here. This creates no record and sends nothing.
          </DialogDescription>
        </DialogHeader>
        <label className="field-label" htmlFor="intent-note">Copy this enquiry and share it through a channel you choose</label>
        <textarea className="intent-note" id="intent-note" readOnly value={note} />
        <div className="dialog-actions">
          <Button className="button button-primary" onClick={copyNote} type="button">
            {copied ? <Check aria-hidden="true" size={15} /> : <Copy aria-hidden="true" size={15} />}
            {copied ? 'Copied on this device' : 'Copy enquiry'}
          </Button>
        </div>
        {error && <p className="inline-error" role="alert">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
