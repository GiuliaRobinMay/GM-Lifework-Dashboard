-- Lifework — what a domain is called, and how it looks.
--
-- The left rail and the tabs are still defined in src/lib/nav.ts: that is the
-- information architecture and it is code. This table only overrides the three
-- things she can change from the interface — the name, the icon and the
-- colour — so a rename never needs a deploy.
-- Safe to re-run.

create table if not exists domain_settings (
  slug       text primary key,
  name       text,
  icon       text,
  accent     text,
  updated_at timestamptz not null default now()
);

alter table domain_settings enable row level security;

drop policy if exists "anon reads domain settings"  on domain_settings;
drop policy if exists "anon writes domain settings" on domain_settings;
create policy "anon reads domain settings"  on domain_settings for select using (true);
create policy "anon writes domain settings" on domain_settings for all    using (true) with check (true);

drop view if exists domain_settings_api;
create view domain_settings_api with (security_invoker = true) as
  select slug, name, icon, accent from domain_settings;

grant select on domain_settings_api to anon, authenticated;
grant select, insert, update on domain_settings to anon, authenticated;
