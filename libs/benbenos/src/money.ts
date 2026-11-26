/**
 * Kenya shilling amounts are stored as whole cents (1 KES = 100) so that sums
 * never drift. The API speaks integers; humans see formatted text.
 */

const KES_PATTERN = /^\d{1,12}(\.\d{1,2})?$/;

/** Parses "12500", "12,500" or "12500.50" into cents. Rejects anything ambiguous. */
export function parseKesToCents(input: string): number {
  const cleaned = input.trim().replace(/,/g, '');
  if (!KES_PATTERN.test(cleaned)) throw new Error('Enter an amount in shillings, for example 12500 or 12500.50.');
  const [whole, fraction = ''] = cleaned.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error('Amount must be greater than zero.');
  return cents;
}

export function formatKes(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new Error('Amount must be a whole number of cents.');
  const sign = cents < 0 ? '-' : '';
  const absolute = Math.abs(cents);
  const shillings = Math.floor(absolute / 100).toLocaleString('en-KE');
  const remainder = String(absolute % 100).padStart(2, '0');
  return `${sign}KES ${shillings}.${remainder}`;
}

/** Outstanding balance: positive means owed, negative means credit. */
export function balanceCents(invoicedCents: number, paidCents: number): number {
  return invoicedCents - paidCents;
}
