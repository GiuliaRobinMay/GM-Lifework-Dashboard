'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '@/lib/supabase';
import type { ClientStatus } from '@/lib/crm';
import { STATUS_ORDER } from '@/lib/crm';

/**
 * The writes the client zone makes: move, archive, delete, create.
 *
 * All go through the same publishable key the reads use. What that key may
 * touch is decided in the database, not here.
 */

type Result = { error: string | null };

function touched(): void {
  revalidatePath('/d/clients', 'layout');
}

export async function setStatus(id: string, status: ClientStatus): Promise<Result> {
  if (!STATUS_ORDER.includes(status)) return { error: `Unknown status: ${status}` };
  const db = getSupabase();
  if (!db) return { error: 'Supabase is not configured.' };
  const { error } = await db.from('client_companies').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  touched();
  return { error: null };
}

export async function archiveClient(id: string): Promise<Result> {
  return setStatus(id, 'archived');
}

export async function deleteClient(id: string): Promise<Result> {
  const db = getSupabase();
  if (!db) return { error: 'Supabase is not configured.' };
  // Contacts and apps cascade from the company row.
  const { error } = await db.from('client_companies').delete().eq('id', id);
  if (error) return { error: error.message };
  touched();
  return { error: null };
}

export type NewClient = {
  name: string;
  firstName: string;
  lastName: string;
  status: ClientStatus;
  email: string;
  website: string;
  communityUrl: string;
  upworkUrl: string;
  notes: string;
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'client';
}

const trim = (v: string) => v.trim() || null;

export async function createClient(input: NewClient): Promise<Result & { id?: string }> {
  const name = input.name.trim();
  if (!name) return { error: 'The community name is required.' };
  if (!STATUS_ORDER.includes(input.status)) return { error: `Unknown status: ${input.status}` };

  const db = getSupabase();
  if (!db) return { error: 'Supabase is not configured.' };

  // Ids are slugs, like the imported rows. If the slug is taken, suffix it
  // rather than fail: two clients really can share a name.
  const base = slug(name);
  const { data: taken } = await db.from('client_companies').select('id').like('id', `${base}%`);
  const ids = new Set((taken ?? []).map((r: { id: string }) => r.id));
  let id = base;
  for (let n = 2; ids.has(id); n++) id = `${base}-${n}`;

  const { error: e1 } = await db.from('client_companies').insert({
    id,
    name,
    status: input.status,
    source: input.upworkUrl.trim() ? 'upwork' : 'direct',
    website: trim(input.website),
    community_url: trim(input.communityUrl),
    upwork_url: trim(input.upworkUrl),
    notes: trim(input.notes),
  });
  if (e1) return { error: e1.message };

  const first = input.firstName.trim();
  if (first) {
    const { error: e2 } = await db.from('client_contacts').insert({
      company_id: id,
      first_name: first,
      last_name: input.lastName.trim(),
      email: trim(input.email),
      is_primary: true,
      source: input.upworkUrl.trim() ? 'upwork' : 'direct',
      needs_check: !input.lastName.trim(),
    });
    if (e2) return { error: e2.message, id };
  }

  touched();
  return { error: null, id };
}
