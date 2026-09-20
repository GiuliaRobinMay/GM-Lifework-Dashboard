-- ============================================================================
-- Lifework — step 2 of 3: the client database
-- ----------------------------------------------------------------------------
-- Supabase is where the CRM is WORKED. Notion stays as the copy, kept current
-- by a push from here (scripts/notion-push.mjs). Nothing reads Notion back, so
-- Notion can never lose a conflict.
--
-- Three tables, because one row per client could not answer the questions
-- being asked of it:
--
--   client_companies  the engagement. One per community.
--   client_contacts   the people. MANY per company — Notion holds one
--                     free-text name per client, so a company with two or
--                     three contacts is a single comma-joined string there.
--   client_apps       what has been built for them, with its repo and URL.
--
-- Fields Notion also has are marked `-- notion` and are pushed back. Fields
-- without that marker exist only here, because Notion has no column for them.
--
-- SAFE TO RE-RUN. Every statement is guarded, so a partial run can simply be
-- run again rather than unpicked by hand.
-- ============================================================================

-- Postgres has no `create type if not exists`, so each enum is created inside
-- a block that swallows only the duplicate-object error.
do $$ begin
  create type client_status   as enum ('active', 'contact', 'sleeping', 'done', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_phase    as enum ('consultancy', 'architecture', 'branding', 'welcome',
                                       'onboarding', 'content', 'landing_page', 'events',
                                       'payment_plans', 'bucket');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_priority as enum ('high', 'normal', 'low', 'later');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_source   as enum ('upwork', 'direct', 'referral', 'community', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_kind        as enum ('app', 'bot', 'automation', 'landing_page', 'integration', 'site');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_state       as enum ('live', 'building', 'paused', 'retired');
exception when duplicate_object then null; end $$;

-- ------------------------------------------------------------- companies

create table if not exists client_companies (
  id            text primary key,          -- slug, stable across renames
  name          text not null,             -- notion: community (title)
  legal_name    text,                      -- the Ltd behind the community
  status        client_status not null default 'contact',  -- notion: client status
  phase         client_phase,              -- notion: construction phase
  priority      client_priority,           -- notion: priority
  source        client_source not null default 'unknown',

  website            text,                 -- notion: website
  community_url      text,                 -- notion: mighty networks
  community_platform text,                 -- Mighty Networks, or its own domain
  upwork_url         text,                 -- notion: upwork
  slack_url          text,                 -- notion: link to slack

  -- An MCP server that can read this community's own data, where one exists.
  mcp_server         text,

  notes   text,                            -- notion: notes
  remarks text,                            -- notion: opmerkingen

  has_automations boolean not null default false,  -- notion: Automations
  has_content_bot boolean not null default false,  -- notion: Content Bot
  has_cm          boolean not null default false,  -- notion: CM
  in_mighty       boolean not null default false,  -- notion: in Mighty
  in_kit          boolean not null default false,  -- notion: in Kit

  -- The link back to the Notion row this mirrors. Null means born here and
  -- not yet pushed; the push script creates the page and fills it in.
  notion_page_id   text unique,
  notion_url       text,
  notion_synced_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_companies_status_idx   on client_companies (status);
create index if not exists client_companies_priority_idx on client_companies (priority);
-- Rows changed since their last push. The push script reads exactly this.
create index if not exists client_companies_dirty_idx    on client_companies (updated_at)
  where notion_synced_at is null or updated_at > notion_synced_at;

-- -------------------------------------------------------------- contacts

create table if not exists client_contacts (
  id         uuid primary key default gen_random_uuid(),
  company_id text not null references client_companies (id) on delete cascade,

  first_name   text not null,
  last_name    text not null default '',
  credentials  text,                       -- CPCC, PhD, LCSW — post-nominals
  role         text,

  email        text,
  phone        text,
  linkedin_url text,
  upwork_url   text,                       -- their own room, when it differs

  is_primary  boolean not null default false,
  source      client_source not null default 'unknown',
  -- Set when the name was inferred rather than confirmed, so the UI can ask.
  needs_check boolean not null default false,
  notes       text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_contacts_company_idx on client_contacts (company_id);

-- At most one primary per company. This is the contact whose name is pushed
-- into Notion's single `client` field.
create unique index if not exists client_contacts_one_primary
  on client_contacts (company_id) where is_primary;

-- ------------------------------------------------------------------ apps

create table if not exists client_apps (
  id         uuid primary key default gen_random_uuid(),
  company_id text not null references client_companies (id) on delete cascade,

  name        text not null,
  kind        app_kind  not null default 'app',
  state       app_state not null default 'live',

  live_url    text,
  repo_url    text,                        -- GitHub
  host        text,                        -- Cloud Run, Netlify, Mighty embed…
  description text,

  shipped_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_apps_company_idx on client_apps (company_id);
create index if not exists client_apps_state_idx   on client_apps (state);

-- ------------------------------------------------------------ updated_at

create or replace trigger client_companies_touch before update on client_companies
  for each row execute function touch_updated_at();
create or replace trigger client_contacts_touch before update on client_contacts
  for each row execute function touch_updated_at();
create or replace trigger client_apps_touch before update on client_apps
  for each row execute function touch_updated_at();

-- ------------------------------------------------------------------- RLS

alter table client_companies enable row level security;
alter table client_contacts  enable row level security;
alter table client_apps      enable row level security;

drop policy if exists "anon reads client_companies" on client_companies;
drop policy if exists "anon reads client_contacts"  on client_contacts;
drop policy if exists "anon reads client_apps"      on client_apps;

create policy "anon reads client_companies" on client_companies for select using (true);
create policy "anon reads client_contacts"  on client_contacts  for select using (true);
create policy "anon reads client_apps"      on client_apps      for select using (true);

-- ------------------------------------------------------------------ views

drop view if exists client_companies_api;
drop view if exists client_contacts_api;
drop view if exists client_apps_api;

create view client_companies_api with (security_invoker = true) as
  select
    id, name, legal_name, status::text, phase::text, priority::text, source::text,
    website, community_url as "communityUrl", community_platform as "communityPlatform",
    upwork_url as "upworkUrl", slack_url as "slackUrl", mcp_server as "mcpServer",
    notes, remarks,
    has_automations as "hasAutomations", has_content_bot as "hasContentBot",
    has_cm as "hasCm", in_mighty as "inMighty", in_kit as "inKit",
    notion_url as "notionUrl",
    (notion_synced_at is null or updated_at > notion_synced_at) as "pendingPush",
    updated_at::text as "updatedAt"
  from client_companies;

create view client_contacts_api with (security_invoker = true) as
  select
    id::text, company_id as "companyId",
    first_name as "firstName", last_name as "lastName", credentials, role,
    email, phone, linkedin_url as "linkedinUrl", upwork_url as "upworkUrl",
    is_primary as "isPrimary", source::text, needs_check as "needsCheck", notes
  from client_contacts;

create view client_apps_api with (security_invoker = true) as
  select
    id::text, company_id as "companyId", name, kind::text, state::text,
    live_url as "liveUrl", repo_url as "repoUrl", host, description,
    shipped_at::text as "shippedAt"
  from client_apps;

grant select on client_companies_api, client_contacts_api, client_apps_api
  to anon, authenticated;
