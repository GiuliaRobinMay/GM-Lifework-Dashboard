# What is wired, what is not, and the order to do it in

## Wired now

| Thing | Source | State |
|---|---|---|
| Navigation, tabs, palette | `src/lib/nav.ts` | Complete |
| Voice rules | BTB brand work | Real, 18 rules |
| App links | Hand-curated | Real, 21 apps, no client platforms |
| Client rows | Notion, live | Adapter stubbed; needs `NOTION_TOKEN` |
| Tasks, content, courses, goals | Shaped stand-ins | Her own only; correct shape |

**No client data is stored anywhere in this project.** See `docs/DATA.md`.

## Order to build

The ordering is by *how much a day changes per hour of work*, not by how
interesting the build is.

### 1. Supabase, for real — half a day

Run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`, then put the
two public env vars in `.env.local`. Nothing in the UI changes; the source note
disappears. Do this first because everything below writes into it.

### 2. Two different Notion reads — one to two days

These are deliberately not the same mechanism, and must not be merged.

**Her own work, synced into Supabase.** A scheduled job pulls GN_tasks and the
Goal Navigator ladder (GN_week / MGN_quarters / GN_years) into `tasks` and
`goal_periods`. One-directional; Notion stays where she captures, Supabase is
the fast read. This turns the Command Center from a well-shaped page into a
true one, every morning.

**Client work, read live and never stored.** Finish `src/lib/notion.ts`: the
clients database and Daily Tasks, queried per request, rendered, discarded. No
job, no table, no cache. Set `NOTION_TOKEN` server-side.

The temptation will be to sync clients too, because it would be faster. Don't —
that is the whole constraint.

### 3. Community servers — two days

Several active clients have MCP servers for their communities. Members, spaces,
events and payments would make "is this community healthy?" answerable without
opening five tabs — read live inside the Clients zone, on the same never-stored
terms as everything else there.

### 4. Upwork sync — one day

The server reads invitations, proposals, contracts, offers and financials. Same
pattern: scheduled job writes rows, the zone reads them.

### 5. The Brain, properly — the big one

This is the piece that makes the dashboard *yours* rather than a nice layout.

- **Authorise Big Tribe Builders Brain.** It cannot be authorised from a
  background session — it needs one interactive connect, from claude.ai connector
  settings. Until then, voice and story retrieval is offline. This blocks
  everything else in this section.
- **Ingest the library.** The books you actually run the business on, plus the
  SPI Academy lessons, as retrievable text rather than a reading list. Each gets
  a `brain_sources` row so a draft can cite which book a claim came from.
- **Wire the saved moves.** Each of the six is a prompt plus the sources it is
  allowed to read. "Draft a LinkedIn post in my voice" should pull a metaphor and
  a story from the brain, then validate the draft against all 18 voice rules
  before you ever see it.

### 6. Content pipeline — after the brain

Drafting is only worth automating once it is grounded in your voice. Doing this
before step 5 produces generic posts faster, which is the opposite of the goal.

## Known gaps, stated plainly

- **QuinB Academy has no server.** Several client communities do. Adding
  QuinB's own would put members, events and revenue on its page — and QuinB is
  yours, so that data may legitimately be stored.
- **LinkedIn has no personal-reach API.** That number stays manual or stays
  absent. It will not be invented.
- **Deployment health is not shown at all.** Every deployment runs for a
  client, so no records are kept. If this becomes a real gap, the answer is a
  live read inside the Clients zone — never a table.
- **Fitness is thin on purpose.** A count you trust beats a chart you do not.
