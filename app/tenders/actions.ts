'use server';

import { revalidatePath } from 'next/cache';
import { localAuthActionBlock } from '@/lib/auth-mode';
import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { parseKesMinorUnits } from '@/lib/school-tender';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function signalTenderCapital(
  tenderId: string,
  amount: string,
): Promise<{ intentId?: string; error?: string }> {
  if (!uuidPattern.test(tenderId)) return { error: 'Tender reference is invalid.' };
  const localBlock = localAuthActionBlock();
  if (localBlock) return { error: localBlock };
  if (!hasSupabaseConfiguration()) return { error: 'Capital Intent is unavailable until authenticated network services are configured.' };
  const amountMinor = parseKesMinorUnits(amount);
  if (amountMinor === undefined || amountMinor <= 0) return { error: 'Enter a positive amount in KES.' };

  try {
    const supabase = await createSupabaseServerClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error(`Your identity could not be verified: ${authError.message}`);
    if (!auth.user) return { error: 'Sign in before recording a Capital Intent Signal.' };

    const { data, error } = await supabase.rpc('signal_tender_capital', {
      p_tender_id: tenderId,
      p_amount_minor: amountMinor,
    });
    if (error) return { error: `Capital Intent was not recorded: ${error.message}` };
    if (typeof data !== 'string') return { error: 'Capital Intent did not return a ledger reference.' };

    revalidatePath('/tenders');
    revalidatePath('/tenders/[id]', 'page');
    revalidatePath('/workspace');
    return { intentId: data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Capital Intent could not be recorded.' };
  }
}
