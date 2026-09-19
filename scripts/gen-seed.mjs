/**
 * Generates supabase/seed.sql from the TypeScript seed modules.
 *
 * The point is that there is exactly one source of truth for the seed rows.
 * Hand-maintaining a parallel .sql file is how the two quietly diverge and you
 * end up debugging a dashboard that shows different data depending on whether
 * Supabase is configured.
 *
 * The seed modules import only types, which Node's type stripping erases
 * entirely — so they load directly, with no build step.
 *
 *   node --experimental-strip-types scripts/gen-seed.mjs
 */
import { writeFileSync } from 'node:fs';
import { APPS } from '../src/lib/seed/apps.ts';
import { BRAIN_SOURCES, VOICE_RULES } from '../src/lib/seed/brain.ts';
import { TASKS, CONTENT, COURSES, GOALS, SIGNALS } from '../src/lib/seed/work.ts';

const q = (v) => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return `array[${v.map((x) => q(x)).join(', ')}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

function insert(table, cols, rows, pick) {
  if (rows.length === 0) return '';
  const head = `insert into ${table} (${cols.map((c) => `"${c}"`).join(', ')}) values\n`;
  const body = rows.map((r) => `  (${pick(r).map(q).join(', ')})`).join(',\n');
  // Idempotent: re-running the seed refreshes rather than fails.
  const update = cols.filter((c) => c !== 'id').map((c) => `"${c}" = excluded."${c}"`).join(', ');
  return `${head}${body}\non conflict (id) do update set ${update};\n\n`;
}

let sql = `-- ============================================================================
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

`;

sql += insert('tasks',
  ['id', 'title', 'source', 'area', 'status', 'priority', 'due_date', 'do_date', 'domain'],
  TASKS,
  (t) => [t.id, t.title, t.source, t.area, t.status, t.priority, t.dueDate, t.doDate, t.domain]);

sql += insert('app_links',
  ['id', 'name', 'url', 'note', 'category', 'domains', 'connected', 'pinned', 'sort_order'],
  APPS,
  (a, i) => [a.id, a.name, a.url, a.note, a.category, a.domains, a.connected, a.pinned, APPS.indexOf(a)]);

sql += insert('brain_sources',
  ['id', 'name', 'kind', 'state', 'reach', 'feeds', 'note'],
  BRAIN_SOURCES,
  (s) => [s.id, s.name, s.kind, s.state, s.reach, s.feeds, s.note]);

sql += insert('voice_rules',
  ['id', 'kind', 'title', 'detail', 'sort_order'],
  VOICE_RULES,
  (r) => [r.id, r.kind, r.title, r.detail, VOICE_RULES.indexOf(r)]);

sql += insert('content_items',
  ['id', 'title', 'channel', 'state', 'scheduled_for', 'campaign', 'venture'],
  CONTENT,
  (c) => [c.id, c.title, c.channel, c.state, c.scheduledFor, c.campaign, c.venture]);

sql += insert('courses',
  ['id', 'title', 'provider', 'lessons_total', 'lessons_done', 'state', 'next_lesson', 'url'],
  COURSES,
  (c) => [c.id, c.title, c.provider, c.lessonsTotal, c.lessonsDone, c.state, c.nextLesson, c.url]);

sql += insert('goal_periods',
  ['id', 'tier', 'title', 'period_start', 'period_end', 'progress'],
  GOALS,
  (g) => [g.id, g.tier, g.title, g.periodStart, g.periodEnd, g.progress]);

sql += insert('signals',
  ['id', 'title', 'detail', 'domain', 'href', 'weight', 'kind'],
  SIGNALS,
  (s) => [s.id, s.title, s.detail, s.domain, s.href, s.weight, s.kind]);

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql);

const total = TASKS.length + APPS.length + BRAIN_SOURCES.length + VOICE_RULES.length
  + CONTENT.length + COURSES.length + GOALS.length + SIGNALS.length;
console.log(`supabase/seed.sql written — ${total} rows, 0 client rows (there is no clients table)`);
