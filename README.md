# Lifework — Giulia May

One operational surface for every venture, client and life domain. Built so the
day starts in one place instead of eleven tabs.

```bash
npm install
npm run dev          # http://localhost:3000
```

It runs immediately, with no database and no keys. See **Data** below.

---

## What this is

A dashboard, not a replacement for your tools. It **links out** to Mighty
Networks, Notion, Upwork, Kit and the rest — it does not rebuild them. What it
adds is the layer none of them can give you: one view across all of them,
ordered by what needs you, rooted in your own intelligence.

## The shape

```
┌────────────┬────────────────────────────────────────────────┐
│            │  top bar — title · pins · ⌘K                   │
│  LEFT RAIL ├────────────────────────────────────────────────┤
│  = WHERE   │  tab strip — the zones of this domain          │
│            ├────────────────────────────────────────────────┤
│  12 items  │                                                │
│  5 groups  │  widget grid                                   │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

**The left rail is where you are.** Stable, never reordered by activity, learned
once. Command Center, then four groups:

| Group | Domains |
|---|---|
| Ventures | Big Tribe Builders · QuinB Academy · Giulia May |
| Work | Clients · Upwork · Apps & Deployments · Content & Social |
| Intelligence | The Brain |
| Life | Studying · Fitness · Accountancy |

**The tab strip is what you are looking at.** Maximum five per domain, and
**there is no level below it**. Anything that would be a fourth click is either
its own domain or a link out.

**Nothing is ever more than two keystrokes away.** `⌘K` reaches every domain,
every tab, every client and every app. That is what lets the rail stay at twelve
and the tabs stay at five — reachability is decoupled from visibility.

## Data

The app reads through `src/lib/data`, which talks to Supabase when it is
configured and falls back to bundled seed when it is not.

```bash
cp .env.example .env.local     # fill in URL + anon key
# run supabase/migrations/0001_init.sql, then supabase/seed.sql
```

Nothing in the UI changes when you switch — the row shapes are identical by
construction. `supabase/seed.sql` is **generated** from the TypeScript seed
(`npm run seed:gen`) so the two cannot drift.

**No client data lives in this repository or its database.** There is no
`clients` table, no `client_id` on tasks, and no deployments table — a
deployment's name and URL each identify the client it runs for. Client
information stays in Notion and is read at request time by `src/lib/notion.ts`,
rendered, and kept nowhere. That is also why no client appears on the Command
Center or in the command palette: the Clients zone is the only place client
information is shown.

To switch that read on, set `NOTION_TOKEN` as a **server-side** variable —
never a `NEXT_PUBLIC_` one, or the browser would carry a key that can read
every client you have.

See [`docs/DESIGN.md`](docs/DESIGN.md) for why the layout is what it is, and
[`docs/ROADMAP.md`](docs/ROADMAP.md) for what is not wired yet and in what order
to wire it.

## Design

Studiolo, unmodified. `src/styles/studiolo-theme.css` is your file, byte for
byte. Everything this dashboard needs on top of it — the tab strip, the widget
grid, the palette, the launcher tiles — lives in `src/styles/lifework.css` and
obeys the same three rules: four colours and no others, colour decorates and
never means, lines stay visible.

## Layout

```
src/
  app/                  routes — one dynamic route serves every domain and tab
  components/
    views/              one module per domain family; the registry dispatches
    ui.tsx              Widget · Stat · Row · Launcher · PageHead
    CommandPalette.tsx  ⌘K
  lib/
    nav.ts              THE information architecture — rail and tabs, one file
    types.ts            the domain model; the contract with the schema
    data/               the read layer; Supabase or seed, never both in the UI
    notion.ts           the live client read — rendered, never stored
    seed/               her own ventures and life only; no client ever
  styles/
supabase/
  migrations/0001_init.sql
  seed.sql              generated — do not edit
```

Renaming a domain, reordering the groups or adding a tab is an edit to
`src/lib/nav.ts`. The sidebar, the tab strip, the routes and the palette all
follow from it.
