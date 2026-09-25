-- 0008_grid_columns.sql — her renames and glyphs for grid columns.
-- Safe to re-run: the table is created only if missing; the view is rebuilt.

create table if not exists grid_columns (
  grid       text not null,
  key        text not null,
  label      text,
  icon       text,
  updated_at timestamptz not null default now(),
  primary key (grid, key)
);

alter table grid_columns enable row level security;

drop policy if exists grid_columns_anon on grid_columns;
create policy grid_columns_anon on grid_columns
  for all to anon using (true) with check (true);

drop view if exists grid_columns_api;
create view grid_columns_api
with (security_invoker = true) as
select grid, key, label, icon
from grid_columns;

grant select on grid_columns_api to anon;
