import type { Client, Task } from '@/lib/types';

/**
 * The live Notion read for the Clients zone.
 *
 * Client data is fetched per request and rendered. It is never written to
 * Supabase, never cached to disk, and never committed. That is the whole
 * point of this module existing separately from src/lib/data: everything in
 * there may be persisted, and nothing in here may be.
 *
 * The database ids come from the environment, not from source: they point at
 * the client database, so they are configuration rather than code.
 *
 *   NOTION_TOKEN               server-side token, never NEXT_PUBLIC_
 *   NOTION_CLIENTS_DB          the clients database
 *   NOTION_CLIENT_TASKS_DB     Daily Tasks — client work
 *
 * A NEXT_PUBLIC_ token would ship a key to the browser that can read every
 * client she has. Keep all three server-side.
 *
 * Until that is wired, these return empty and the Clients zone says so rather
 * than showing invented rows.
 */

const TOKEN = process.env.NOTION_TOKEN;
const CLIENTS_DB = process.env.NOTION_CLIENTS_DB;
const CLIENT_TASKS_DB = process.env.NOTION_CLIENT_TASKS_DB;

export const isNotionConfigured = Boolean(TOKEN && CLIENTS_DB);

export type LiveRead<T> = {
  rows: T[];
  /** False when the zone is showing nothing because nothing is connected. */
  connected: boolean;
  error: string | null;
};

const empty = <T>(): LiveRead<T> => ({ rows: [], connected: false, error: null });

/** Reads the Notion clients database. Nothing is persisted. */
export async function readClients(): Promise<LiveRead<Client>> {
  if (!isNotionConfigured) return empty<Client>();

  // TODO: query CLIENTS_DB and map rows onto the Client type.
  // `client status` values carry emoji prefixes (🟢 ACTIVE, ☎️ CONTACT) —
  // map them onto the clean ClientStatus enum rather than comparing the bare
  // word, which silently matches nothing.
  return empty<Client>();
}

/** Reads open rows from Daily Tasks — client work only. Nothing is persisted. */
export async function readClientTasks(): Promise<LiveRead<Task>> {
  if (!isNotionConfigured || !CLIENT_TASKS_DB) return empty<Task>();

  // TODO: query CLIENT_TASKS_DB where `done` is unchecked.
  return empty<Task>();
}
