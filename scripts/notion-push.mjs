/**
 * Push client changes from Supabase back into Notion.
 *
 *     npm run clients:push          # show what would change
 *     npm run clients:push -- --go  # actually write
 *
 * Direction is one-way on purpose: Supabase is where the CRM is worked, Notion
 * is the copy that stays current and keeps working on her phone when this
 * dashboard is not running. Notion is never retired and never the loser in a
 * conflict — because nothing here ever reads Notion back, there is no conflict
 * to lose.
 *
 * What gets pushed: only the fields Notion has a column for. The contacts
 * table has no Notion equivalent, so the PRIMARY contact's name is written
 * into Notion's single free-text `client` field and the others stay here. That
 * keeps the Notion copy recognisable to her without pretending it holds the
 * full contact list.
 *
 * Dry run by default. A CRM sync that writes on its first run, before anyone
 * has looked at the diff, is how 51 rows get quietly mangled.
 */
import { createClient } from '@supabase/supabase-js';

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GO = process.argv.includes('--go');

if (!NOTION_TOKEN || !SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing configuration. Needs NOTION_TOKEN, NEXT_PUBLIC_SUPABASE_URL and\n' +
    'SUPABASE_SERVICE_ROLE_KEY. All server-side — never NEXT_PUBLIC_ for the\n' +
    'Notion token, or the browser would carry a key that reads every client.',
  );
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

/** Notion's select options carry emoji prefixes; the enum here does not. */
const STATUS = {
  active: '🟢 ACTIVE', contact: '☎️ CONTACT', sleeping: '😴 SLEEPING',
  done: '✅ DONE', archived: '📦 ARCHIVE',
};
const PHASE = {
  consultancy: '💬 CONSULTANCY', architecture: '🏛️ ARCHITECTURE', branding: '🎨 BRANDING',
  welcome: '👋 WELCOME', onboarding: '⛵️ ONBOARDING', content: '🖋️ CONTENT',
  landing_page: '🛬 LANDING PAGE', events: '🎪 EVENTS & EXPERIENCES',
  payment_plans: '💰 PAYMENT PLANS', bucket: '🪣 BUCKET',
};
const PRIORITY = { high: 'HIGH', normal: 'NORMAL', low: 'LOW', later: 'LATER' };

const text = (v) => (v ? { rich_text: [{ text: { content: String(v).slice(0, 2000) } }] } : { rich_text: [] });
const url = (v) => ({ url: v || null });
const select = (v) => (v ? { select: { name: v } } : { select: null });
const checkbox = (v) => ({ checkbox: Boolean(v) });

async function notion(path, method, body) {
  const res = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

// Rows changed since their last push. Companies born here have no page yet.
const { data: rows, error } = await db
  .from('client_companies')
  .select('*, client_contacts(first_name, last_name, credentials, email, is_primary)')
  .or('notion_synced_at.is.null,updated_at.gt.notion_synced_at');

if (error) {
  console.error('Supabase read failed:', error.message);
  process.exit(1);
}

if (!rows?.length) {
  console.log('Nothing to push — Notion is level with Supabase.');
  process.exit(0);
}

console.log(`${rows.length} row${rows.length === 1 ? '' : 's'} changed since the last push${GO ? '' : '  (dry run)'}\n`);

let pushed = 0;
for (const r of rows) {
  const primary = (r.client_contacts ?? []).find((c) => c.is_primary)
    ?? (r.client_contacts ?? [])[0];
  const clientName = primary
    ? [primary.first_name, primary.last_name].filter(Boolean).join(' ')
      + (primary.credentials ? `, ${primary.credentials}` : '')
    : null;
  const others = (r.client_contacts ?? []).length - (primary ? 1 : 0);

  const properties = {
    community: { title: [{ text: { content: r.name } }] },
    client: text(clientName),
    'client status': select(STATUS[r.status]),
    'construction phase': select(PHASE[r.phase]),
    priority: select(PRIORITY[r.priority]),
    website: url(r.website),
    'mighty networks': url(r.community_url),
    upwork: url(r.upwork_url),
    'link to slack': url(r.slack_url),
    notes: text(r.notes),
    opmerkingen: text(r.remarks),
    Automations: checkbox(r.has_automations),
    'Content Bot': checkbox(r.has_content_bot),
    CM: checkbox(r.has_cm),
    'in Mighty': checkbox(r.in_mighty),
    'in Kit': checkbox(r.in_kit),
  };
  if (primary?.email) properties.email = { email: primary.email };

  const note = others > 0 ? `  (+${others} more contact${others === 1 ? '' : 's'}, kept in Lifework)` : '';
  console.log(`  ${r.notion_page_id ? 'update' : 'CREATE'}  ${r.name}${note}`);

  if (!GO) continue;

  try {
    if (r.notion_page_id) {
      await notion(`pages/${r.notion_page_id}`, 'PATCH', { properties });
    } else {
      const page = await notion('pages', 'POST', {
        parent: { database_id: process.env.NOTION_CLIENTS_DB },
        properties,
      });
      await db.from('client_companies')
        .update({ notion_page_id: page.id.replace(/-/g, ''), notion_url: page.url })
        .eq('id', r.id);
    }
    await db.from('client_companies')
      .update({ notion_synced_at: new Date().toISOString() })
      .eq('id', r.id);
    pushed += 1;
  } catch (e) {
    console.error(`    failed: ${e.message}`);
  }
}

console.log(GO
  ? `\nPushed ${pushed} of ${rows.length}.`
  : '\nDry run — nothing written. Re-run with --go to push.');
