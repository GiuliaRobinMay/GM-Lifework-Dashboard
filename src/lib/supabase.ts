import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase wiring.
 *
 * The dashboard is built for Supabase from the start, but it does not require
 * it to run. When the two public env vars are absent, every reader in
 * src/lib/data falls back to the bundled seed. That keeps two things true at
 * once: you can open the thing today and judge the design, and there is no
 * second data path to retire later — the shapes are identical.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/** Returns null when Supabase is not configured, so callers fall back to seed. */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!cached) {
    cached = createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    });
  }
  return cached;
}

/**
 * Read a table, or fall back.
 *
 * A failed query is never fatal here. This is a personal dashboard: showing
 * the seed with a warning beats showing an error page, and the warning is
 * surfaced in the UI rather than swallowed.
 */
export async function readTable<T>(table: string, fallback: T[]): Promise<{
  rows: T[];
  source: 'supabase' | 'seed';
  error: string | null;
}> {
  const db = getSupabase();
  if (!db) return { rows: fallback, source: 'seed', error: null };

  const { data, error } = await db.from(table).select('*');
  if (error) {
    return { rows: fallback, source: 'seed', error: error.message };
  }
  return { rows: (data ?? []) as T[], source: 'supabase', error: null };
}
