'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import { ICON_CHOICES, ACCENT_CHOICES } from '@/lib/nav';

/**
 * Rename or recolour a domain.
 *
 * Only the three fields she can reach from the interface are written, and
 * each is checked against the set the code knows how to render — a value
 * that is not one of ours never reaches the database.
 */
export async function saveDomainSettings(
  slug: string,
  input: { name: string; icon: string; accent: string },
): Promise<{ error: string | null }> {
  const db = getSupabase();
  if (!db) return { error: 'Supabase is not configured, so there is nowhere to save this.' };

  const name = input.name.trim();
  if (!name) return { error: 'A domain needs a name.' };
  if (!ICON_CHOICES.includes(input.icon as never)) return { error: 'That is not one of the icons.' };
  if (!ACCENT_CHOICES.includes(input.accent as never)) return { error: 'That is not one of the colours.' };

  const { error } = await db
    .from('domain_settings')
    .upsert({ slug, name, icon: input.icon, accent: input.accent, updated_at: new Date().toISOString() });

  if (error) return { error: error.message };

  // The name and colour are in the rail and the chrome, which every page
  // draws, so the whole layout is revalidated rather than one route.
  revalidatePath('/', 'layout');
  return { error: null };
}
