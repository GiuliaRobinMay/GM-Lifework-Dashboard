-- ============================================================================
-- Lifework — seed data
-- ----------------------------------------------------------------------------
-- GENERATED FILE. Do not edit by hand.
-- Regenerate with:  npm run seed:gen
-- Source of truth:  src/lib/seed/*.ts
--
-- NO CLIENT DATA. Client information lives in Notion and is read at request
-- time; it is never seeded, stored or committed. These rows are her own
-- ventures and her own life only.
-- ============================================================================

insert into tasks ("id", "title", "source", "area", "status", "priority", "due_date", "do_date", "domain") values
  ('t1', 'Write chapter 9', 'gn_tasks', 'Admin & Business', 'in_progress', 'high', '2026-09-30', '2026-09-19', 'giulia-may'),
  ('t2', 'Record the BTB ribbon walkthrough', 'gn_tasks', 'Sales', 'inbox', null, null, null, 'big-tribe-builders'),
  ('t3', 'Rewrite the ROOTS one-pager', 'gn_tasks', 'Sales', 'next', 'medium', '2026-09-25', null, 'big-tribe-builders'),
  ('t4', 'September meetup prep', 'gn_tasks', 'Admin & Business', 'next', 'medium', '2026-09-24', null, 'quinb-academy'),
  ('t5', 'Draft the welcome sequence', 'gn_tasks', 'Admin & Business', 'next', null, null, null, 'quinb-academy'),
  ('t6', 'Book the podcast round', 'gn_tasks', 'Sales', 'waiting_on', null, null, null, 'giulia-may'),
  ('t7', 'Learn n8n', 'gn_tasks', 'Personal Development', 'next', null, null, null, 'studying'),
  ('t8', 'Finish Smart Offer Design', 'gn_tasks', 'Personal Development', 'in_progress', null, null, '2026-09-19', 'studying'),
  ('t9', 'Run three times this week', 'gn_tasks', 'Sports', 'in_progress', null, '2026-09-21', null, 'fitness'),
  ('t10', 'Q3 VAT filing', 'gn_tasks', 'Admin & Business', 'next', 'urgent', '2026-10-20', null, 'accountancy'),
  ('t11', 'Chase the September invoices', 'gn_tasks', 'Admin & Business', 'next', 'high', '2026-09-20', null, 'accountancy'),
  ('t12', 'Approve this week’s LinkedIn posts', 'gn_tasks', 'Sales', 'next', 'high', '2026-09-19', '2026-09-19', 'content')
on conflict (id) do update set "title" = excluded."title", "source" = excluded."source", "area" = excluded."area", "status" = excluded."status", "priority" = excluded."priority", "due_date" = excluded."due_date", "do_date" = excluded."do_date", "domain" = excluded."domain";

insert into app_links ("id", "name", "url", "note", "category", "domains", "connected", "pinned", "sort_order") values
  ('quinb', 'QuinB Academy', 'https://quinb.mn.co', 'Your host community', 'Communities', array['quinb-academy']::text[], false, true, 0),
  ('notion', 'Notion', 'https://notion.so', 'Tasks, clients, goals', 'Work & Delivery', array['clients', 'big-tribe-builders']::text[], true, true, 1),
  ('gmail', 'Gmail', 'https://mail.google.com', 'Email', 'Work & Delivery', array[]::text[], true, true, 2),
  ('gcal', 'Calendar', 'https://calendar.google.com', 'The week', 'Work & Delivery', array[]::text[], true, true, 3),
  ('gdrive', 'Drive', 'https://drive.google.com', 'Files', 'Work & Delivery', array[]::text[], true, false, 4),
  ('upwork', 'Upwork', 'https://www.upwork.com/nx/find-work/', 'Inbound work', 'Work & Delivery', array['upwork']::text[], true, true, 5),
  ('zoom', 'Zoom', 'https://zoom.us', 'Calls and recordings', 'Work & Delivery', array[]::text[], true, false, 6),
  ('linkedin', 'LinkedIn', 'https://www.linkedin.com/feed/', 'Primary channel', 'Content & Social', array['content']::text[], false, true, 7),
  ('higgsfield', 'Higgsfield', 'https://higgsfield.ai', 'Video and image', 'Content & Social', array['content']::text[], true, false, 8),
  ('youtube', 'YouTube Studio', 'https://studio.youtube.com', 'Long form', 'Content & Social', array['content']::text[], false, false, 9),
  ('instagram', 'Instagram', 'https://instagram.com', 'Short form', 'Content & Social', array['content']::text[], false, false, 10),
  ('kit', 'Kit', 'https://app.kit.com', 'Newsletter and sequences', 'Email & Audience', array['giulia-may', 'content']::text[], true, false, 11),
  ('github', 'GitHub', 'https://github.com/GiuliaRobinMay', 'Repositories', 'Build & Deploy', array['apps']::text[], true, false, 12),
  ('netlify', 'Netlify', 'https://app.netlify.com', 'Static hosting', 'Build & Deploy', array['apps']::text[], true, false, 13),
  ('gcloud', 'Google Cloud', 'https://console.cloud.google.com', 'Cloud Run, BigQuery', 'Build & Deploy', array['apps']::text[], false, false, 14),
  ('supabase', 'Supabase', 'https://supabase.com/dashboard', 'This dashboard’s database', 'Build & Deploy', array['apps']::text[], false, false, 15),
  ('claude', 'Claude', 'https://claude.ai', 'The thinking partner', 'Build & Deploy', array['brain']::text[], true, true, 16),
  ('stripe', 'Stripe', 'https://dashboard.stripe.com', 'Payments', 'Money', array['accountancy']::text[], false, false, 17),
  ('accounting', 'Accounting', 'https://www.e-boekhouden.nl', 'Books and VAT', 'Money', array['accountancy']::text[], false, false, 18),
  ('spi', 'SPI Academy', 'https://community.smartpassiveincome.com', 'Courses you follow', 'Learning', array['studying']::text[], false, false, 19),
  ('strava', 'Strava', 'https://www.strava.com/dashboard', 'Training log', 'Personal', array['fitness']::text[], false, false, 20)
on conflict (id) do update set "name" = excluded."name", "url" = excluded."url", "note" = excluded."note", "category" = excluded."category", "domains" = excluded."domains", "connected" = excluded."connected", "pinned" = excluded."pinned", "sort_order" = excluded."sort_order";

insert into brain_sources ("id", "name", "kind", "state", "reach", "feeds", "note") values
  ('btb-brain', 'Big Tribe Builders Brain', 'graph', 'needs_auth', '22k chunks · 19k nodes · the 15-chapter book', array['content', 'big-tribe-builders', 'giulia-may', 'brain']::text[], 'The GraphRAG corpus behind your voice and stories. Needs authorising once in an interactive session before this dashboard can read it.'),
  ('btb-team-memory', 'BTB Team Memory', 'mcp', 'connected', 'Agency decisions and ways of working', array['apps', 'big-tribe-builders']::text[], 'Shared memory bank across the team. Decisions of record live here.'),
  ('notion-brain', 'Notion', 'database', 'connected', 'GN_tasks · Goal Navigator · the client zone, read live', array['studying', 'fitness', 'accountancy']::text[], 'The system of record. Her own work is mirrored here; client work is read at request time and never stored.'),
  ('upwork-mcp', 'Upwork', 'mcp', 'connected', 'Jobs, proposals, contracts, offers, financials', array['upwork']::text[], null),
  ('google-mcp', 'Google Workspace', 'mcp', 'connected', 'Gmail · Calendar · Drive', array['content', 'accountancy']::text[], null),
  ('kit-mcp', 'Kit', 'mcp', 'connected', 'Subscribers, broadcasts, sequences, stats', array['content', 'giulia-may']::text[], null),
  ('spi-corpus', 'SPI Academy lessons', 'corpus', 'planned', 'Course notes and transcripts', array['studying', 'content']::text[], 'Not yet ingested. Once in, lessons can be cited directly in drafts.'),
  ('books-corpus', 'Business library', 'corpus', 'planned', 'The books you actually run your business on', array['brain', 'content', 'big-tribe-builders']::text[], 'StoryBrand, Aaron Dignan, Wes McDowell and the rest — as retrievable text, not a reading list.')
on conflict (id) do update set "name" = excluded."name", "kind" = excluded."kind", "state" = excluded."state", "reach" = excluded."reach", "feeds" = excluded."feeds", "note" = excluded."note";

insert into voice_rules ("id", "kind", "title", "detail", "sort_order") values
  ('v1', 'principle', 'Start mid-thought', 'Open with "So…" — as if continuing a conversation already in progress. Never open with a throat-clear.', 0),
  ('v2', 'principle', 'Talk to one person', '"You guys", "be welcome", "just hop in". Second person, singular in feeling even when plural in words.', 1),
  ('v3', 'principle', 'Lead with a metaphor', 'You think in images. The house, the village, the octopus with eight brains. A paragraph without an image is a paragraph to rewrite.', 2),
  ('v4', 'principle', 'Normalise the struggle', '"I don''t want you to be disappointed", "rest assured", "it''s all good". Remove shame before giving instruction.', 3),
  ('v5', 'principle', 'Magical, but grounded in systems', 'The aliveness AND the backbone. Optimism that can point at a structure.', 4),
  ('v6', 'principle', 'Warm and unguarded', '"I so appreciate you", "super fun", "beautiful and amazing people". Effusive is on-brand; corporate is not.', 5),
  ('l1', 'lexicon', 'Signature words', 'tribe · the house · behind closed doors · the village · journey · building blocks · backbone · pillars · container · the magic · the secret sauce · aliveness · thriving · vibrant · knowledge vault · playground · baby steps · noise · the dip · 360 view', 6),
  ('l2', 'lexicon', 'Core concepts', 'purpose · culture · connection · belonging · experience · onboarding · the host role · show up · co-creation', 7),
  ('l3', 'lexicon', 'Locked phrases', '"Build big. Stay human." · "from asset to feeling" · "a home behind closed doors" · "architect and alchemist" · "you stay rare, your members feel home"', 8),
  ('a1', 'avoid', 'Never corporate-speak', 'No "leverage", "synergy", "solutions", "deliverables" in outward copy.', 9),
  ('a2', 'avoid', 'Never guru hype', 'No "2 clicks", no "10x", no fake urgency, no hustle framing.', 10),
  ('a3', 'avoid', 'Never imply it is easy', 'Nothing that shames a reader for finding community building hard. It is hard. Say so.', 11),
  ('a4', 'avoid', 'Never overpromise the team', 'BTB is you and your son. No "big team", no "we launch and grow it for you". Elite advisory: you make the plan, they implement.', 12),
  ('a5', 'avoid', 'No jargon without an image', 'If a term cannot be paired with a picture, it does not go in.', 13),
  ('s1', 'story', 'The first community', 'Nobody came. The origin of everything you now teach about the container.', 14),
  ('s2', 'story', 'Green Exam Academy', 'The proof story — where the method first worked at scale.', 15),
  ('s3', 'story', 'Launched on my father''s birthday', 'The personal anchor. Use sparingly, never as a device.', 16),
  ('s4', 'story', 'The client transformations', 'Three engagements, each a different shape of change. Names come from the client zone when a story is actually being written — never from here.', 17)
on conflict (id) do update set "kind" = excluded."kind", "title" = excluded."title", "detail" = excluded."detail", "sort_order" = excluded."sort_order";

insert into content_items ("id", "title", "channel", "state", "scheduled_for", "campaign", "venture") values
  ('c1', 'The community that quietly died', 'LinkedIn', 'review', '2026-09-19', 'Book runway', 'giulia-may'),
  ('c2', 'Why your onboarding is the whole product', 'LinkedIn', 'scheduled', '2026-09-22', 'ROOTS teaching', 'btb'),
  ('c3', 'Build big, stay human — what it means in practice', 'Newsletter', 'drafting', '2026-09-24', 'Book runway', 'btb'),
  ('c4', 'The octopus with eight brains', 'LinkedIn', 'idea', null, null, 'giulia-may'),
  ('c5', 'Five signs your community is too big for one host', 'YouTube', 'idea', null, 'ROOTS teaching', 'btb'),
  ('c6', 'Inside the academy — a host’s week', 'Newsletter', 'published', '2026-09-15', null, 'quinb'),
  ('c7', 'What I learned launching on my father’s birthday', 'LinkedIn', 'published', '2026-09-12', 'Book runway', 'giulia-may')
on conflict (id) do update set "title" = excluded."title", "channel" = excluded."channel", "state" = excluded."state", "scheduled_for" = excluded."scheduled_for", "campaign" = excluded."campaign", "venture" = excluded."venture";

insert into courses ("id", "title", "provider", "lessons_total", "lessons_done", "state", "next_lesson", "url") values
  ('co1', 'Smart Offer Design', 'SPI Academy', 6, 1, 'studying', 'Part 1 — Module 1 · 18 min', 'https://community.smartpassiveincome.com'),
  ('co2', 'Lead Magnet Mini-Series', 'SPI Academy', 5, 2, 'studying', 'Part 3 — the delivery sequence', 'https://community.smartpassiveincome.com'),
  ('co3', 'Landing Pages 101', 'SPI Academy', 8, 8, 'done', null, 'https://community.smartpassiveincome.com'),
  ('co4', 'Email Marketing Magic', 'SPI Academy', 7, 0, 'to_study', 'Part 1 — the welcome sequence', 'https://community.smartpassiveincome.com'),
  ('co5', 'n8n automation', 'Self-directed', 12, 3, 'studying', 'Webhooks and error branches', null)
on conflict (id) do update set "title" = excluded."title", "provider" = excluded."provider", "lessons_total" = excluded."lessons_total", "lessons_done" = excluded."lessons_done", "state" = excluded."state", "next_lesson" = excluded."next_lesson", "url" = excluded."url";

insert into goal_periods ("id", "tier", "title", "period_start", "period_end", "progress") values
  ('g1', 'year', '2026 | The book, and BTB as the firm', '2026-01-01', '2026-12-31', 72),
  ('g2', 'quarter', '2026 Q3 | Book draft + BTB site live', '2026-07-01', '2026-09-30', 80),
  ('g3', 'week', 'Week 38 | Chapter 9 + the ROOTS one-pager', '2026-09-14', '2026-09-20', 55)
on conflict (id) do update set "tier" = excluded."tier", "title" = excluded."title", "period_start" = excluded."period_start", "period_end" = excluded."period_end", "progress" = excluded."progress";

insert into signals ("id", "title", "detail", "domain", "href", "weight", "kind") values
  ('s1', 'Chapter 9 is the only thing between you and the draft', 'Due 30 Sep. Everything else on the book is waiting behind it.', 'giulia-may', '/d/giulia-may/book', 90, 'blocked'),
  ('s2', 'One LinkedIn post needs approving', '"The community that quietly died" goes out today.', 'content', '/d/content/today', 80, 'blocked'),
  ('s3', 'September invoices not chased', 'Due tomorrow. Admin & Business.', 'accountancy', '/d/accountancy/invoices', 70, 'money'),
  ('s4', 'Big Tribe Builders Brain is not authorised', 'Voice and story retrieval is offline until it is connected.', 'brain', '/d/brain/sources', 60, 'blocked'),
  ('s5', 'Client work is not connected yet', 'The Clients zone reads Notion at request time. NOTION_TOKEN is not set.', 'clients', '/d/clients/active', 50, 'waiting')
on conflict (id) do update set "title" = excluded."title", "detail" = excluded."detail", "domain" = excluded."domain", "href" = excluded."href", "weight" = excluded."weight", "kind" = excluded."kind";

