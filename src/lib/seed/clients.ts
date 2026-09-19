import type { Client } from '@/lib/types';

/**
 * Deliberately empty, and it must stay that way.
 *
 * No client of hers is named in this repository, in its seed, or in its
 * database. Client information lives in Notion and is read from Notion at
 * request time by src/lib/notion.ts — rendered, never stored.
 *
 * This constant exists so the Clients zone has the same fallback shape as
 * every other domain, not as a place to put rows. If you are about to add a
 * client here, don't: add it in Notion.
 *
 * See docs/DATA.md § "Client data never lands here".
 */
export const CLIENTS: Client[] = [];
