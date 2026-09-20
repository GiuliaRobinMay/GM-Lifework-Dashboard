-- ============================================================================
-- Lifework — initial schema
-- ----------------------------------------------------------------------------
-- Step 1 of 3. The foundation: her own work, plus the pieces the client
-- database needs — the pgcrypto extension and touch_updated_at(). The client
-- tables themselves arrive in 0002_clients.sql, which will not run without
-- this file first.
--
-- `tasks` here holds HER OWN work (GN_tasks). Client work lives in the client
-- tables from step 2.
--
-- Single-tenant by design. This is Giulia's dashboard; there is no second user,
-- and pretending otherwise would buy complexity nothing needs. RLS is still on
-- every table, because the anon key ships to the browser and "no other user"
-- is not the same as "anyone may read it".
--
-- Column names match src/lib/types.ts exactly (snake_case here, camelCase
-- there — see the note on the view at the bottom).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums

create type venture       as enum ('btb', 'quinb', 'direct');
create type task_source   as enum ('daily_tasks', 'gn_tasks');
create type task_status   as enum ('inbox', 'next', 'in_progress', 'waiting_on', 'someday', 'done');
create type priority      as enum ('urgent', 'high', 'medium', 'low');
create type source_kind   as enum ('mcp', 'graph', 'corpus', 'database');
create type source_state  as enum ('connected', 'needs_auth', 'planned');
create type content_state as enum ('idea', 'drafting', 'review', 'scheduled', 'published');
create type course_state  as enum ('to_study', 'studying', 'done');
create type goal_tier     as enum ('year', 'quarter', 'week');

-- ------------------------------------------------------------------ tasks

create table tasks (
  id          text primary key,
  title       text not null,
  source      task_source not null,
  area        text,
  status      task_status not null default 'inbox',
  priority    priority,
  due_date    date,
  do_date     date,
  -- Which dashboard domain this task belongs on.
  domain      text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tasks_domain_idx on tasks (domain) where status <> 'done';
create index tasks_due_idx    on tasks (due_date) where status <> 'done';

comment on column tasks.source is
  'daily_tasks = client work, gn_tasks = her own work. The split is deliberate:
   client tasks leaking into the Goal Navigator stop it working as one.';

-- ------------------------------------------------------------- app_links

create table app_links (
  id        text primary key,
  name      text not null,
  url       text not null,
  note      text not null default '',
  category  text not null,
  -- Dashboard domains where this link should surface.
  domains   text[] not null default '{}',
  -- True when the tool also has an MCP server wired into the brain.
  connected boolean not null default false,
  pinned    boolean not null default false,
  sort_order integer not null default 0
);

create index app_links_category_idx on app_links (category, sort_order);

-- --------------------------------------------------------- brain_sources

create table brain_sources (
  id     text primary key,
  name   text not null,
  kind   source_kind  not null,
  state  source_state not null default 'planned',
  reach  text not null default '',
  feeds  text[] not null default '{}',
  note   text
);

-- ----------------------------------------------------------- voice_rules

create table voice_rules (
  id     text primary key,
  kind   text not null check (kind in ('principle', 'lexicon', 'avoid', 'story')),
  title  text not null,
  detail text not null,
  sort_order integer not null default 0
);

comment on table voice_rules is
  'Written so a checker can apply them, not as adjectives. Every draft the
   dashboard produces is validated against these before it is shown.';

-- -------------------------------------------------------- content_items

create table content_items (
  id            text primary key,
  title         text not null,
  channel       text not null,
  state         content_state not null default 'idea',
  scheduled_for date,
  campaign      text,
  venture       text not null default 'btb',
  body          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index content_state_idx on content_items (state, scheduled_for);

-- ---------------------------------------------------------------- courses

create table courses (
  id            text primary key,
  title         text not null,
  provider      text not null,
  lessons_total integer not null default 0,
  lessons_done  integer not null default 0,
  state         course_state not null default 'to_study',
  next_lesson   text,
  url           text,
  constraint courses_done_within_total check (lessons_done <= lessons_total)
);

-- ----------------------------------------------------------- goal_periods

create table goal_periods (
  id           text primary key,
  tier         goal_tier not null,
  title        text not null,
  period_start date not null,
  period_end   date not null,
  progress     integer check (progress between 0 and 100),
  constraint goal_period_ordered check (period_end >= period_start)
);

comment on table goal_periods is
  'The Goal Navigator ladder. One focus theme per period, not a list of goals —
   titles read like "2026 Q3 | Book draft + BTB site live".';

-- --------------------------------------------------------------- signals

create table signals (
  id      text primary key,
  title   text not null,
  detail  text not null default '',
  domain  text not null,
  href    text not null,
  -- Editorial judgement about the cost of waiting. Not a priority field.
  weight  integer not null default 0,
  kind    text not null check (kind in ('blocked', 'overdue', 'waiting', 'money', 'live')),
  created_at timestamptz not null default now()
);

create index signals_weight_idx on signals (weight desc);

-- ------------------------------------------------------------ updated_at

create or replace function touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_touch         before update on tasks         for each row execute function touch_updated_at();
create trigger content_items_touch before update on content_items for each row execute function touch_updated_at();

-- ------------------------------------------------------------------- RLS
--
-- Read-only to the anon key, which is what the browser carries. Writes go
-- through the service role from a server context (the sync jobs), never from
-- the page. If this ever gains a second user, swap `true` for an auth check —
-- the policies are already in the right place.

alter table tasks         enable row level security;
alter table app_links     enable row level security;
alter table brain_sources enable row level security;
alter table voice_rules   enable row level security;
alter table content_items enable row level security;
alter table courses       enable row level security;
alter table goal_periods  enable row level security;
alter table signals       enable row level security;

create policy "anon reads tasks"         on tasks         for select using (true);
create policy "anon reads app_links"     on app_links     for select using (true);
create policy "anon reads brain_sources" on brain_sources for select using (true);
create policy "anon reads voice_rules"   on voice_rules   for select using (true);
create policy "anon reads content_items" on content_items for select using (true);
create policy "anon reads courses"       on courses       for select using (true);
create policy "anon reads goal_periods"  on goal_periods  for select using (true);
create policy "anon reads signals"       on signals       for select using (true);

-- ------------------------------------------------------- camelCase views
--
-- PostgREST returns column names verbatim, and the TypeScript types are
-- camelCase. Rather than map in application code on every read, expose views
-- with the names the client already expects. src/lib/data reads these.

create view tasks_api with (security_invoker = true) as
  select id, title, source::text, area, status::text, priority::text,
         due_date::text as "dueDate", do_date::text as "doDate", domain
  from tasks;

create view app_links_api with (security_invoker = true) as
  select id, name, url, note, category, domains, connected, pinned
  from app_links order by sort_order;

create view brain_sources_api with (security_invoker = true) as
  select id, name, kind::text, state::text, reach, feeds, note
  from brain_sources;

create view voice_rules_api with (security_invoker = true) as
  select id, kind, title, detail from voice_rules order by sort_order;

create view content_items_api with (security_invoker = true) as
  select id, title, channel, state::text,
         scheduled_for::text as "scheduledFor", campaign, venture
  from content_items;

create view courses_api with (security_invoker = true) as
  select id, title, provider, lessons_total as "lessonsTotal",
         lessons_done as "lessonsDone", state::text,
         next_lesson as "nextLesson", url
  from courses;

create view goal_periods_api with (security_invoker = true) as
  select id, tier::text, title, period_start::text as "periodStart",
         period_end::text as "periodEnd", progress
  from goal_periods;

create view signals_api with (security_invoker = true) as
  select id, title, detail, domain, href, weight, kind
  from signals order by weight desc;

-- The anon key reads through the views only; the tables stay unreachable
-- except via a policy, and the views carry security_invoker so those policies
-- still apply.
grant select on
  tasks_api, app_links_api, brain_sources_api, voice_rules_api,
  content_items_api, courses_api, goal_periods_api, signals_api
to anon, authenticated;
