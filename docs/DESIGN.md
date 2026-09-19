# Why the dashboard is shaped like this

You asked for an operational dashboard where the things you work on all day are
one click away, with tabs at the top so you can move inside an area without
funnelling deeper. This is the reasoning behind what got built.

## The research

I looked at how operational SaaS products solve exactly this problem —
Twenty, Asana, Wrike, ClickUp, Whop and Kajabi. The pattern that survives in all
of them is the same three-part split:

| Layer | Question it answers | Property |
|---|---|---|
| Left rail | *Where am I?* | Stable. Never reorders. Learned once. |
| Tab strip | *What am I looking at?* | Cheap to cross. Never nests. |
| Widget grid | *What is true right now?* | Dense, scannable, one card per idea. |

Whop and Kajabi both group the rail into labelled sections rather than one long
list — which is what makes twelve destinations scan like four. Asana opens on a
greeting plus "my tasks" rather than a chart, because the first question in the
morning is never "how are we trending".

The thing none of the screenshots shows, because it is invisible until you press
it, is the **command palette**. Linear, Notion, Superhuman and Raycast all have
one, and it is the actual answer to your click-depth problem.

## The three rules this produced

**1. The rail is where, the tabs are what.**
Moving between zones of a domain never touches the rail; moving between domains
never resets your tab. Your hand learns two independent gestures instead of one
tree.

**2. There is no third level.**
Twelve rail items × five tabs = sixty destinations, all reachable in two clicks.
The moment something wants a level below the tabs, it is either its own domain
or it is a link out to the tool that already does it well. This is the rule that
keeps the funnelling from creeping back in.

**3. Reachability is decoupled from visibility.**
`⌘K` reaches every domain, every tab, all 51 clients and every app — including
things deliberately not on the rail. That is *why* the rail can stay at twelve.
Without the palette, every new thing would have to fight for rail space; with it,
the rail can stay a map rather than an index.

## Why these twelve domains

You named them: QuinB Academy, Big Tribe Builders, Upwork, Accountancy, Fitness,
Studying, deployments, social media. I grouped them by how they actually behave,
which is what makes the rail scan:

- **Ventures** — your three businesses. Their work goes to GN_tasks, because they
  are yours, not clients'. That split already exists in your Notion setup and the
  dashboard respects it rather than inventing a new one.
- **Work** — where other people's money and deadlines live.
- **Intelligence** — The Brain, on its own, because it is not a domain you visit
  so much as a layer the others read from.
- **Life** — the three that go invisible when client work gets loud. They are on
  the rail for exactly that reason.

CRM is not a separate domain; it *is* Clients. Adding a "CRM" entry beside a
"Clients" entry would be two doors to one room.

## Why the Command Center looks like that

Reading order is deliberate:

1. **Needs you** — ordered by cost of waiting, not by priority field. Six rows
   maximum. This is the only widget that earns the top-left corner.
2. **Today** — dated work from both task databases, merged.
3. **Four numbers** — each one a link into its domain. A number you cannot act
   on does not belong here.
4. **Your ventures / Going out** — the two things that move the business. Not
   clients: those are one click away, in the only zone that holds them.
5. **Jump back in** — leaving is a legitimate action, so it gets a real place
   rather than being a failure state.

If a widget would not change a decision in the next hour, it is not on this page.
That is the whole editorial rule.

## Why colour is never meaning

Studiolo is explicit that colour rotates and decorates. I kept that: accents
cycle violet → red → green → orange down every list so neighbours differ, and
**nothing** is encoded in which colour a card gets. Status is carried by badges
and words, because that survives colourblindness, greyscale printing and a user
who has not memorised your palette.

The one place colour does carry meaning is where Studiolo already said it should:
green for done, orange for in progress or late, red for high priority or
destructive, violet for the primary action.

## Where client information is, and is not

Client information lives in Notion and nowhere else. This dashboard reads it at
request time, renders it, and keeps nothing — no database table, no seed row, no
cache, nothing committed.

That rule has a visible consequence, which is the point: the Clients zone is the
**only** place a client appears. Not the Command Center, not the command
palette, not the Launchpad, not Apps & Deployments. An operational dashboard
naturally wants to pull the interesting rows onto every screen; here it must
not, so the attention list carries "client work is not connected yet" rather
than the client work itself.

The cut that proves the rule is Apps & Deployments. Every deployment in this
business runs for a client, and its name, host and URL each name that client —
so the domain holds no deployment records at all, and points at the client zone
instead. "Wired" still appears inside the Clients zone, marking which
communities can be read rather than merely opened; it just never leaves it.

## What it deliberately does not do

- **No fake charts.** A zone with no live source says so in one line and shows
  the real work and real links it does have. A plausible-looking chart built from
  invented numbers is worse than an empty state, because you would eventually
  make a decision on it.
- **No third-party calls at render time.** Upwork, Kit and the community servers
  are all connected and could be queried on page load. They are not, because a
  dashboard that hits five APIs per navigation is slow by week two and
  rate-limited by week three. Those go through a scheduled sync into Supabase.
- **No rebuilding of tools that work.** Notion stays the system of record for
  tasks and clients. This reads it.
- **No client data at rest.** Covered above, and worth repeating because it is
  the constraint most likely to be quietly violated by a future feature that
  "just needs the client name".
