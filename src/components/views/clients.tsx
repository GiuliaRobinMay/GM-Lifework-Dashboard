import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import type { Company, Contact } from '@/lib/crm';
import {
  STATUS_LABEL, PHASE_LABEL, fullName, contactsFor, primaryContact,
  appsFor, byStatus, companyLinks, platformOf,
} from '@/lib/crm';
import { accentAt } from '@/lib/nav';
import { Widget, Stat, Row, Rows, Empty, Badge } from '@/components/ui';
import { Zone } from '@/components/views/shared';

/**
 * Clients — the CRM.
 *
 * Worked here, pushed to Notion. Three tables behind it, because one row per
 * client could not answer the questions she has: the company, the PEOPLE
 * (Notion holds one free-text name per client, so two contacts were a single
 * comma-joined string there), and what has been built for them.
 */
export function clientsZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  if (!b.crmConnected) return notConnected(domain, tab, b);

  switch (tab.slug) {
    case 'active': return listView(domain, tab, b, byStatus(b.companies, 'active'), 'Live engagements');
    case 'pipeline': return listView(domain, tab, b, byStatus(b.companies, 'contact'), 'Pipeline');
    case 'communities': return communitiesView(domain, tab, b);
    case 'delivery': return deliveryView(domain, tab, b);
    default: return listView(domain, tab, b,
      b.companies.filter((c) => ['done', 'sleeping', 'archived'].includes(c.status)),
      'Finished and sleeping');
  }
}

function statusBadge(c: Company) {
  const tone = c.status === 'active' ? 'green'
    : c.status === 'sleeping' ? 'orange'
    : undefined;
  return <Badge tone={tone}>{STATUS_LABEL[c.status]}</Badge>;
}

/** The line under a company name: who, where, what phase. */
function subtitle(c: Company, contacts: Contact[]): string {
  const people = contactsFor(contacts, c.id);
  const who = people.length === 0 ? null
    : people.length === 1 ? fullName(people[0])
    : `${fullName(people[0])} +${people.length - 1}`;
  return [who, platformOf(c), c.phase ? PHASE_LABEL[c.phase] : null]
    .filter(Boolean).join(' · ');
}

// ------------------------------------------------------------ not connected

function notConnected(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="card accent-orange" style={{ padding: 24 }}>
        <div className="hstack" style={{ gap: 16, alignItems: 'flex-start' }}>
          <span className="icon-chip icon-chip--lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <ellipse cx="12" cy="6.5" rx="7.5" ry="3" /><path d="M4.5 6.5v11c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-11" />
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="section-title">The client database is not connected yet</p>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.65, maxWidth: 640 }}>
              Three tables are ready — companies, contacts and the apps built for each client.
              Run <code>0001_init.sql</code>, then <code>0002_clients.sql</code>, then the import
              you were sent, and 51 companies and 59 contacts land here.
            </p>
            <p className="muted" style={{ marginTop: 10, lineHeight: 1.65, maxWidth: 640 }}>
              After that, this is where you work. <code>npm run clients:push</code> writes changes
              back to Notion so the copy there stays current — dry run first, <code>--go</code> to
              commit.
            </p>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="col-6">
          <Widget title="What the database holds" accent="violet" flush>
            <Rows>
              <Row accent={accentAt(0)} icon="users" title="Companies" sub="Status, phase, priority, website, community, Upwork, Slack, Notion" />
              <Row accent={accentAt(1)} icon="briefcase" title="Contacts" sub="Many per company — first and last name, email, phone, role" />
              <Row accent={accentAt(2)} icon="rocket" title="Apps" sub="What you built for them, with its GitHub repo and live URL" />
            </Rows>
          </Widget>
        </div>
        <div className="col-6">
          <Widget title="Which way the data moves" accent="green" flush>
            <Rows>
              <Row accent={accentAt(0)} title="Supabase → Notion" sub="Push on change. Notion keeps the copy and is never retired." />
              <Row accent={accentAt(1)} title="Notion → Supabase" sub="One-off import only. Nothing reads Notion back, so nothing can be overwritten." />
            </Rows>
            <div className="widget__foot">
              <p className="muted">
                Contacts and apps have no Notion column. The primary contact&rsquo;s name is written
                into Notion&rsquo;s single <code>client</code> field; the rest live only here.
              </p>
            </div>
          </Widget>
        </div>
      </section>
    </Zone>
  );
}

// --------------------------------------------------------------- list views

function listView(domain: Domain, tab: Tab, b: Bundle, rows: Company[], title: string): ReactNode {
  const unchecked = b.contacts.filter(
    (c) => c.needsCheck && rows.some((r) => r.id === c.companyId),
  );
  const pending = rows.filter((c) => c.pendingPush);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="grid">
        <div className="col-3"><Stat label={title} value={rows.length} meta="In this view" accent="violet" /></div>
        <div className="col-3"><Stat label="Contacts" value={b.contacts.filter((c) => rows.some((r) => r.id === c.companyId)).length} meta="People, not companies" accent="red" /></div>
        <div className="col-3"><Stat label="From Upwork" value={rows.filter((c) => c.source === 'upwork').length} meta="Where the work came from" accent="green" /></div>
        <div className="col-3"><Stat label="Waiting to push" value={pending.length} meta="Changed since last Notion sync" accent="orange" /></div>
      </section>

      {unchecked.length > 0 ? (
        <div className="notice">
          <span className="icon-chip icon-chip--sm accent-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" /><path d="M12 8v5M12 16h.01" />
            </svg>
          </span>
          <div>
            <p className="row__title" style={{ fontSize: 14 }}>
              {unchecked.length} contact{unchecked.length === 1 ? '' : 's'} came from Notion with a first name only
            </p>
            <p className="muted" style={{ marginTop: 2 }}>
              Carried across as-is rather than guessed at. They are marked on the company below.
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid">
        <div className="col-12">
          <Widget title={title} accent="violet" flush action={<span className="badge">{rows.length}</span>}>
            {rows.length === 0 ? <Empty>Nothing here.</Empty> : (
              <Rows>
                {rows.map((c, i) => {
                  const apps = appsFor(b.clientApps, c.id).length;
                  const people = contactsFor(b.contacts, c.id);
                  return (
                    <Row
                      key={c.id}
                      accent={accentAt(i)}
                      icon="users"
                      title={c.name}
                      sub={subtitle(c, b.contacts)}
                      href={`/d/clients/${tab.slug}/${c.id}`}
                      aside={
                        <>
                          {people.some((p) => p.needsCheck) ? <Badge tone="orange">check name</Badge> : null}
                          {apps > 0 ? <Badge>{apps} app{apps === 1 ? '' : 's'}</Badge> : null}
                          {c.mcpServer ? <Badge tone="green">wired</Badge> : null}
                          {statusBadge(c)}
                        </>
                      }
                    />
                  );
                })}
              </Rows>
            )}
          </Widget>
        </div>
      </section>
    </Zone>
  );
}

// -------------------------------------------------------------- communities

function communitiesView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const withCommunity = b.companies.filter((c) => c.communityUrl);
  const platforms = new Map<string, Company[]>();
  for (const c of withCommunity) {
    const p = platformOf(c) ?? 'Unknown';
    platforms.set(p, [...(platforms.get(p) ?? []), c]);
  }
  const ordered = [...platforms.entries()].sort((a, b2) => b2[1].length - a[1].length);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="grid">
        <div className="col-4"><Stat label="Communities" value={withCommunity.length} meta="With a platform URL" accent="violet" /></div>
        <div className="col-4"><Stat label="On Mighty Networks" value={withCommunity.filter((c) => platformOf(c) === 'Mighty Networks').length} meta="The house platform" accent="red" /></div>
        <div className="col-4"><Stat label="Readable from here" value={b.companies.filter((c) => c.mcpServer).length} meta="Have a live server" accent="green" /></div>
      </section>

      <section className="grid">
        {ordered.map(([platform, rows], i) => (
          <div className={rows.length > 6 ? 'col-12' : 'col-6'} key={platform}>
            <Widget title={platform} accent={accentAt(i)} flush action={<span className="badge">{rows.length}</span>}>
              <Rows>
                {rows.map((c, j) => (
                  <Row
                    key={c.id}
                    accent={accentAt(j)}
                    title={c.name}
                    sub={c.communityUrl ?? undefined}
                    href={c.communityUrl}
                    external
                    aside={c.mcpServer ? <Badge tone="green">wired</Badge> : undefined}
                  />
                ))}
              </Rows>
            </Widget>
          </div>
        ))}
      </section>
    </Zone>
  );
}

// ----------------------------------------------------------------- delivery

function deliveryView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const active = byStatus(b.companies, 'active');

  return (
    <Zone domain={domain} tab={tab} b={b}>
      {b.clientTasks.length === 0 ? (
        <div className="notice">
          <span className="icon-chip icon-chip--sm accent-violet">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
              <rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M8 9h8M8 13h5" />
            </svg>
          </span>
          <div>
            <p className="row__title" style={{ fontSize: 14 }}>Open client work still lives in Notion</p>
            <p className="muted" style={{ marginTop: 2 }}>
              Daily Tasks is read per request and not stored — it is where you capture by voice.
              Set <code>NOTION_TOKEN</code> and <code>NOTION_CLIENT_TASKS_DB</code> to switch it on.
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid">
        {active.map((c, i) => {
          const tasks = b.clientTasks.filter((t) => t.clientId === c.id);
          const apps = appsFor(b.clientApps, c.id);
          return (
            <div className="col-4" key={c.id}>
              <Widget
                title={c.name}
                accent={accentAt(i)}
                flush
                action={tasks.length > 0 ? <span className="badge">{tasks.length}</span> : undefined}
              >
                {tasks.length === 0 && apps.length === 0 ? <Empty>Clear.</Empty> : (
                  <Rows>
                    {tasks.map((t) => (
                      <Row key={t.id} title={t.title} sub={t.status.replace('_', ' ')} />
                    ))}
                    {apps.map((a) => (
                      <Row key={a.id} title={a.name} sub={`${a.kind.replace('_', ' ')} · ${a.state}`} href={a.liveUrl} external={Boolean(a.liveUrl)} />
                    ))}
                  </Rows>
                )}
              </Widget>
            </div>
          );
        })}
      </section>
    </Zone>
  );
}

// ------------------------------------------------------------- detail page

/** One client: the people, the links, and what has been built for them. */
export function companyDetail(company: Company, b: Bundle): ReactNode {
  const people = contactsFor(b.contacts, company.id);
  const apps = appsFor(b.clientApps, company.id);
  const links = companyLinks(company);
  const tasks = b.clientTasks.filter((t) => t.clientId === company.id);

  return (
    <main className="content content--wide stack">
      <div className="pagehead">
        <div className="pagehead__text">
          <p className="eyebrow">
            <Link className="link" href="/d/clients/active">Clients</Link>
            {' · '}{STATUS_LABEL[company.status]}
          </p>
          <h1 className="page-title" style={{ marginTop: 6 }}>{company.name}</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            {[company.legalName, platformOf(company), company.phase ? PHASE_LABEL[company.phase] : null]
              .filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
        <div className="pagehead__actions">
          {links.map((l) => (
            <a key={l.label} className="btn btn--ghost" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
          ))}
        </div>
      </div>

      {company.pendingPush ? (
        <div className="notice">
          <span className="icon-chip icon-chip--sm accent-orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
              <path d="M12 4v10M8 10l4 4 4-4M4 19h16" />
            </svg>
          </span>
          <div>
            <p className="row__title" style={{ fontSize: 14 }}>Changed since the last push to Notion</p>
            <p className="muted" style={{ marginTop: 2 }}>
              Run <code>npm run clients:push</code> to bring the Notion copy level.
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid">
        <div className="col-7">
          <Widget
            title="Contacts"
            accent="violet"
            flush
            action={<span className="badge">{people.length}</span>}
          >
            {people.length === 0 ? <Empty>No contact recorded.</Empty> : (
              <Rows>
                {people.map((p, i) => (
                  <Row
                    key={p.id}
                    accent={accentAt(i)}
                    icon="users"
                    title={fullName(p)}
                    sub={[p.role, p.email, p.phone].filter(Boolean).join(' · ') || 'No email or phone on file'}
                    aside={
                      <>
                        {p.needsCheck ? <Badge tone="orange">check</Badge> : null}
                        {p.isPrimary ? <Badge tone="green">primary</Badge> : null}
                      </>
                    }
                  />
                ))}
              </Rows>
            )}
            <div className="widget__foot">
              <p className="muted">
                The primary contact&rsquo;s name is what gets written into Notion&rsquo;s single
                <code> client</code> field. The others live only here.
              </p>
            </div>
          </Widget>
        </div>

        <div className="col-5">
          <div className="stack-sm">
            <Widget title="Engagement" accent="green" flush>
              <Rows>
                <Row title="Status" sub={STATUS_LABEL[company.status]} />
                <Row title="Phase" sub={company.phase ? PHASE_LABEL[company.phase] : 'Not set'} />
                <Row title="Priority" sub={company.priority ?? 'Not set'} />
                <Row title="Came from" sub={company.source === 'upwork' ? 'Upwork' : company.source} />
              </Rows>
            </Widget>

            <Widget title="Running for them" accent="orange" flush>
              <Rows>
                <Row title="Automations" sub={company.hasAutomations ? 'Yes' : 'No'} />
                <Row title="Content bot" sub={company.hasContentBot ? 'Yes' : 'No'} />
                <Row title="Community management" sub={company.hasCm ? 'Yes' : 'No'} />
                {company.mcpServer ? <Row title="Readable from here" sub={company.mcpServer} /> : null}
              </Rows>
            </Widget>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="col-7">
          <Widget
            title="Apps built for them"
            accent="red"
            flush
            action={<span className="badge">{apps.length}</span>}
          >
            {apps.length === 0 ? (
              <Empty>Nothing recorded yet. Add what you have shipped for this client.</Empty>
            ) : (
              <Rows>
                {apps.map((a, i) => (
                  <Row
                    key={a.id}
                    accent={accentAt(i)}
                    icon="rocket"
                    title={a.name}
                    sub={[a.kind.replace('_', ' '), a.host, a.description].filter(Boolean).join(' · ')}
                    href={a.liveUrl ?? a.repoUrl}
                    external={Boolean(a.liveUrl || a.repoUrl)}
                    aside={
                      <>
                        {a.repoUrl ? <Badge>repo</Badge> : null}
                        <Badge tone={a.state === 'live' ? 'green' : a.state === 'retired' ? undefined : 'orange'}>
                          {a.state}
                        </Badge>
                      </>
                    }
                  />
                ))}
              </Rows>
            )}
          </Widget>
        </div>

        <div className="col-5">
          <Widget title="Notes" accent="violet">
            {company.notes || company.remarks ? (
              <div className="stack-sm">
                {company.notes ? <p className="muted" style={{ lineHeight: 1.65 }}>{company.notes}</p> : null}
                {company.remarks ? (
                  <>
                    <p className="eyebrow" style={{ marginTop: 8 }}>Opmerkingen</p>
                    <p className="muted" style={{ lineHeight: 1.65 }}>{company.remarks}</p>
                  </>
                ) : null}
              </div>
            ) : <p className="muted">Nothing noted.</p>}
          </Widget>
        </div>
      </section>

      {tasks.length > 0 ? (
        <section className="grid">
          <div className="col-12">
            <Widget title="Open work" accent="orange" flush action={<span className="badge">{tasks.length}</span>}>
              <Rows>
                {tasks.map((t, i) => (
                  <Row key={t.id} accent={accentAt(i)} title={t.title} sub={t.status.replace('_', ' ')} />
                ))}
              </Rows>
            </Widget>
          </div>
        </section>
      ) : null}
    </main>
  );
}
