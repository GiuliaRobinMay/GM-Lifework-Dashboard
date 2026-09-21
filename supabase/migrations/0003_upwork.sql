-- Lifework — Upwork: the top of the funnel.
-- Every person you have talked to on Upwork, one row each, plus what has
-- been invoiced to them over time. Read from the freelancer account only.
-- Safe to re-run.

do $$ begin
  create type lead_status as enum ('lead', 'client', 'lost');
exception when duplicate_object then null; end $$;

-- The Upwork accounts this dashboard reads. One for now; the agency can be
-- switched on later by adding a row and syncing it.
create table if not exists upwork_accounts (
  id      text primary key,          -- Upwork org_uid
  name    text not null,
  role    text not null,             -- Freelancer / Agency
  enabled boolean not null default true
);
insert into upwork_accounts (id, name, role) values
  ('1352608530249863169', 'Geertrui Lauwaert', 'Freelancer')
on conflict (id) do nothing;

create table if not exists upwork_leads (
  id                text primary key,                 -- the Upwork room id
  account_id        text not null references upwork_accounts (id),
  name              text not null,                    -- as Upwork shows it
  status            lead_status not null default 'lead',
  client_company_id text references client_companies (id) on delete set null,

  -- the conversation
  room_url          text,
  room_type         text,                             -- INTERVIEW / ONE_ON_ONE / GROUP
  first_contact_at  timestamptz,
  last_activity_at  timestamptz,
  awaiting_reply    text,                             -- 'you' | 'them' | null
  unread            integer not null default 0,

  -- what you set by hand
  had_appointment   boolean not null default false,
  notes             text,

  -- the proposal, when one was sent for this person
  proposal_sent     boolean not null default false,
  proposal_id       text,
  proposal_url      text,
  proposal_text     text,
  job_title         text,
  job_url           text,
  rate              numeric(10,2),
  rate_currency     text not null default 'USD',

  -- the contract, when it came to one
  contract_id       text,
  contract_status   text,                             -- ACTIVE / PAUSED / CLOSED
  contract_title    text,

  -- totals, kept current from the invoice rows below
  billed_total      numeric(12,2) not null default 0,
  earned_total      numeric(12,2) not null default 0,

  synced_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists upwork_leads_account_idx  on upwork_leads (account_id);
create index if not exists upwork_leads_status_idx   on upwork_leads (status);
create index if not exists upwork_leads_activity_idx on upwork_leads (last_activity_at desc);

-- One row per client, per job, per billing period — what "invoiced over
-- time" is made of.
create table if not exists upwork_invoices (
  id           bigint generated always as identity primary key,
  account_id   text not null references upwork_accounts (id),
  lead_id      text references upwork_leads (id) on delete cascade,
  client_name  text not null,                          -- as Upwork bills it
  job_title    text not null,
  period_from  date not null,
  period_to    date not null,
  billed       numeric(12,2) not null default 0,
  earned       numeric(12,2) not null default 0,
  fee          numeric(12,2) not null default 0,
  currency     text not null default 'USD',
  synced_at    timestamptz not null default now(),
  unique (account_id, client_name, job_title, period_from, period_to)
);

create index if not exists upwork_invoices_lead_idx on upwork_invoices (lead_id);

create or replace trigger upwork_leads_touch before update on upwork_leads
  for each row execute function touch_updated_at();

alter table upwork_accounts enable row level security;
alter table upwork_leads    enable row level security;
alter table upwork_invoices enable row level security;

drop policy if exists "anon reads upwork_accounts" on upwork_accounts;
create policy "anon reads upwork_accounts" on upwork_accounts for select using (true);
drop policy if exists "anon reads upwork_leads"    on upwork_leads;
drop policy if exists "anon reads upwork_invoices" on upwork_invoices;
create policy "anon reads upwork_leads"    on upwork_leads    for select using (true);
create policy "anon reads upwork_invoices" on upwork_invoices for select using (true);

drop view if exists upwork_leads_api;
create view upwork_leads_api with (security_invoker = true) as
  select
    id, account_id as "accountId", name, status::text, client_company_id as "clientCompanyId",
    room_url as "roomUrl", room_type as "roomType",
    first_contact_at::text as "firstContactAt", last_activity_at::text as "lastActivityAt",
    awaiting_reply as "awaitingReply", unread,
    had_appointment as "hadAppointment", notes,
    proposal_sent as "proposalSent", proposal_id as "proposalId", proposal_url as "proposalUrl",
    proposal_text as "proposalText", job_title as "jobTitle", job_url as "jobUrl",
    rate, rate_currency as "rateCurrency",
    contract_id as "contractId", contract_status as "contractStatus", contract_title as "contractTitle",
    billed_total as "billedTotal", earned_total as "earnedTotal",
    synced_at::text as "syncedAt", updated_at::text as "updatedAt"
  from upwork_leads;

drop view if exists upwork_invoices_api;
create view upwork_invoices_api with (security_invoker = true) as
  select
    id, account_id as "accountId", lead_id as "leadId", client_name as "clientName", job_title as "jobTitle",
    period_from::text as "periodFrom", period_to::text as "periodTo",
    billed, earned, fee, currency
  from upwork_invoices;

grant select on upwork_accounts, upwork_leads_api, upwork_invoices_api to anon, authenticated;
