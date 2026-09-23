-- Lifework — the order of the rail, and which collection a space sits in.
--
-- nav.ts still defines what exists. These two carry only what she can move:
-- the order of the collections, the order of the spaces inside one, and which
-- collection a space belongs to.
-- Safe to re-run.

alter table domain_settings add column if not exists group_name text;
alter table domain_settings add column if not exists sort_order integer;

create table if not exists collection_settings (
  name       text primary key,
  sort_order integer not null,
  updated_at timestamptz not null default now()
);

alter table collection_settings enable row level security;

drop policy if exists "anon reads collections"  on collection_settings;
drop policy if exists "anon writes collections" on collection_settings;
create policy "anon reads collections"  on collection_settings for select using (true);
create policy "anon writes collections" on collection_settings for all    using (true) with check (true);

drop view if exists domain_settings_api;
create view domain_settings_api with (security_invoker = true) as
  select slug, name, icon, accent,
         group_name as "groupName", sort_order as "sortOrder"
  from domain_settings;

drop view if exists collection_settings_api;
create view collection_settings_api with (security_invoker = true) as
  select name, sort_order as "sortOrder" from collection_settings;

grant select on domain_settings_api, collection_settings_api to anon, authenticated;
grant select, insert, update on collection_settings to anon, authenticated;
