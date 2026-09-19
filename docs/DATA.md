# Data

## Client data never lands here

This is the rule the rest of the file is arranged around.

**Nothing that identifies a client is stored in this repository, in Supabase, or
in any cache.** No `clients` table. No `client_id` on tasks. No deployments
table, because a deployment's name, host and URL each name the client it runs
for. No client in the seed, the command palette, the Command Center or the
Launchpad.

Client information lives in Notion, is read at request time by
`src/lib/notion.ts`, is rendered, and is kept nowhere. The Clients zone is the
only screen it appears on.

To switch that read on, set `NOTION_TOKEN` as a **server-side** variable. Never
`NEXT_PUBLIC_NOTION_TOKEN` — that ships the key to the browser, where it can
read every client she has.

If a future change wants a client column "just for a name", that is this rule
being violated, not an exception to it.

## Where a row comes from

```
                          her own work
Notion ──(scheduled, one-way)──▶ Supabase ──(read)──▶ Dashboard
  │                                                       ▲
  │ system of record                  client work         │
  └───────────────(live, per request, never stored)───────┘
```

Two different paths on purpose. Her own work is mirrored into Supabase because
it is hers and speed matters. Client work is read live and discarded, because
storing it is the thing we are not doing.

The sync for her own work is **one-way**. Bidirectional sync doubles the failure
modes and ends with you trusting neither side.

## The fallback, and why it exists

`src/lib/data` reads Supabase when `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, and bundled seed when they are not. A
failed query also falls back, with the error surfaced on screen rather than
swallowed.

This is not a demo mode. It exists so there is never a second data path to
retire: the seed satisfies exactly the same TypeScript types as the database,
which is enforced by generating `supabase/seed.sql` from the seed modules
(`npm run seed:gen`).

## camelCase views

PostgREST returns column names verbatim, and the types are camelCase. Rather
than map every row in application code, the migration exposes `*_api` views with
the names the client already expects. They carry `security_invoker = true`, so
the RLS policies on the underlying tables still apply — a view without that flag
runs as its definer and quietly bypasses RLS.

The anon key is granted `select` on the views only.

## The two task databases

The split is yours, and here it also decides what may be stored:

- **Daily Tasks** → client work. Read live in the Clients zone, never stored.
- **GN_tasks** → your own work, in the Goal Navigator. Personal, sports, admin,
  business building. Mirrored into Supabase.

Your own ventures — QuinB Academy, Big Tribe Builders, your community — are your
business, not clients, so they go to GN_tasks. This is why they sit under
**Ventures** on the rail rather than inside the CRM.

## Dates

Everything resolves against **Europe/Brussels**, matching how tasks are captured.
"Today" means today where you are, not where the server is.

## Client identity, when the live read is built

Match on **sound**, not spelling — dictated client names arrive mangled.
`community` is the title and what she says out loud; `client` is the person; she
uses them interchangeably. Some rows have no `client`, so never identify a row
on that column alone.

`client status` values carry emoji prefixes (`🟢 ACTIVE`, `☎️ CONTACT`), which is
why the schema stores a clean enum instead and the sync maps into it.
