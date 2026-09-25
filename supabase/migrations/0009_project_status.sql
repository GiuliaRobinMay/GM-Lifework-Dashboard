-- 0009_project_status.sql — her call on where a project stands.
--
-- Building | Live | Archived, set from the grid with a dropdown. This is a
-- judgement, not a reading: whether a thing counts as live is hers to say,
-- so it is written from the page like her other adjustments (0006, 0008),
-- with the grant narrowed to this one column.
--
-- The existing code_projects_api view stays untouched; the status travels
-- through its own small view and is merged onto the rows in src/lib/data.
-- Safe to re-run.

alter table code_projects
  add column if not exists status text not null default 'building';

do $$ begin
  alter table code_projects
    add constraint code_projects_status_check
    check (status in ('building', 'live', 'archived'));
exception when duplicate_object then null; end $$;

drop view if exists code_projects_status_api;
create view code_projects_status_api with (security_invoker = true) as
  select session_id as "sessionId", status from code_projects;

grant select on code_projects_status_api to anon, authenticated;

-- The page may change status and nothing else; the WHERE needs to see the key.
grant select (session_id), update (status) on code_projects to anon, authenticated;

drop policy if exists code_projects_anon_status on code_projects;
create policy code_projects_anon_status on code_projects
  for update to anon using (true) with check (true);
