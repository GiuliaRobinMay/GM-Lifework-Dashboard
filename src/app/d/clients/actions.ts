'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import type { ClientStatus } from '@/lib/crm';
import { STATUS_ORDER } from '@/lib/crm';

/**
 * Move a client to another status.
 *
 * The only write the client zone makes. It goes through the same publishable
 * key the reads use, and the database grants that key update on the status
 * column alone, so nothing else on the row can change from here.
 */
export async function setStatus(id: string, status: ClientStatus): Promise<{ error: string | null }> {
  if (!STATUS_ORDER.includes(status)) return { error: `Unknown status: ${status}` };
  const db = getSupabase();
  if (!db) return { error: 'Supabase is not configured.' };

  const { error } = await db.from('client_companies').update({ status }).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/d/clients', 'layout');
  return { error: null };
}
