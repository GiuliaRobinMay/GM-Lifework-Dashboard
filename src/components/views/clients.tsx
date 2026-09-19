import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import type { Client } from '@/lib/types';
import { ROOTS } from '@/lib/types';
import { accentAt } from '@/lib/nav';
import { Widget, Stat, Row, Rows, Empty, Badge } from '@/components/ui';
import { Zone } from '@/components/views/shared';
import { activeClients, pipelineClients, archivedClients, shortDate } from '@/lib/data';

/**
 * Clients — the only zone that touches client data, and the only one allowed to.
 *
 * Rows come from Notion at request time (src/lib/notion.ts). Nothing here is
 * stored in Supabase, cached to disk, committed to the repository, or carried
 * into the command palette, the Command Center or any other domain. When the
 * Notion connection is not configured, this zone says so plainly rather than
 * showing anything invented.
 */
export function clientsZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  if (!b.clientsConnected) return notConnected(domain, tab, b);

  switch (tab.slug) {
    case 'active': return activeView(domain, tab, b);
    case 'pipeline': return listView(domain, tab, b, pipelineClients(b.clients), 'Pipeline', 'red');
    case 'communities': return communitiesView(domain, tab, b);
    case 'delivery': return deliveryView(domain, tab, b);
    default: return listView(domain, tab, b, archivedClients(b.clients), 'Finished and sleeping', 'green');
  }
}

function statusBadge(c: Client) {
  if (c.status === 'active') return <Badge tone="green">Active</Badge>;
  if (c.status === 'contact') return <Badge>Contact</Badge>;
  if (c.status === 'sleeping') return <Badge tone="orange">Sleeping</Badge>;
  return <Badge>Done</Badge>;
}

// ------------------------------------------------------------ not connected

/**
 * The honest empty state.
 *
 * This is what the zone looks like until NOTION_TOKEN is set server-side. It
 * explains the rule rather than apologising for the gap, because the rule is
 * deliberate: nothing about a client is kept here.
 */
function notConnected(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Zone
      domain={domain}
      tab={tab}
      b={b}
      actions={
        <a className="btn btn--ghost" href="https://notion.so" target="_blank" rel="noreferrer">
          Open Notion
        </a>
      }
    >
      <section className="card accent-orange" style={{ padding: 24 }}>
        <div className="hstack" style={{ gap: 16, alignItems: 'flex-start' }}>
          <span className="icon-chip icon-chip--lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
              <path d="M8 9h8M8 13h5" />
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="section-title">Client data is read from Notion, and only from Notion</p>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.65, maxWidth: 620 }}>
              Nothing about your clients is stored in this dashboard, its database, or its
              repository. This zone fetches from Notion when the page loads, renders it, and keeps
              nothing. That is why no client name appears on the Command Center, in the command
              palette, or anywhere else in the environment.
            </p>
            <p className="muted" style={{ marginTop: 10, lineHeight: 1.65, maxWidth: 620 }}>
              To switch it on, set <code>NOTION_TOKEN</code> as a server-side variable — never a
              <code> NEXT_PUBLIC_</code> one, or the browser would carry a key that can read every
              client you have.
            </p>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="col-6">
          <Widget title="What this zone will show" accent="violet" flush>
            <Rows>
              {domain.tabs.map((t, i) => (
                <Row key={t.slug} accent={accentAt(i)} title={t.label} sub={t.blurb} />
              ))}
            </Rows>
          </Widget>
        </div>
        <div className="col-6">
          <Widget title="Where it comes from" accent="green" flush>
            <Rows>
              <Row
                icon="users"
                accent="violet"
                title="Clients database"
                sub="Community, contact, status and platform"
              />
              <Row
                icon="briefcase"
                accent="red"
                title="Daily Tasks"
                sub="Open client work, linked to the client it belongs to"
              />
            </Rows>
            <div className="widget__foot">
              <p className="muted">
                Read at request time. Your own work lives in GN_tasks and is the only task data this
                dashboard keeps.
              </p>
            </div>
          </Widget>
        </div>
      </section>
    </Zone>
  );
}

// ------------------------------------------------------------------- active

function activeView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const rows = activeClients(b.clients);
  const wired = rows.filter((c) => c.mcpServer);
  const totalOpen = b.clientTasks.length;

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <LiveNote />
      <section className="grid">
        <div className="col-3"><Stat label="Engagements" value={rows.length} meta="Live right now" accent="violet" /></div>
        <div className="col-3"><Stat label="Open work" value={totalOpen} meta="From Daily Tasks" accent="red" /></div>
        <div className="col-3"><Stat label="Wired to a server" value={`${wired.length}/${rows.length}`} meta="Readable from here" accent="green" /></div>
        <div className="col-3"><Stat label="In pipeline" value={pipelineClients(b.clients).length} meta="Not closed yet" accent="orange" /></div>
      </section>

      <section className="grid">
        <div className="col-12">
          <Widget title="Live engagements" accent="violet" flush>
            {rows.length === 0 ? <Empty>No active clients returned.</Empty> : (
              <Rows>
                {rows.map((c, i) => (
                  <Row
                    key={c.id}
                    accent={accentAt(i)}
                    icon="users"
                    title={c.community}
                    sub={[
                      c.contact,
                      c.rootsPhase ? ROOTS.find((r) => r.key === c.rootsPhase)?.name : null,
                      c.lastTouch ? `last touch ${shortDate(c.lastTouch)}` : null,
                    ].filter(Boolean).join(' · ')}
                    href={c.notionUrl}
                    external
                    aside={<>{c.mcpServer ? <Badge tone="green">wired</Badge> : null}{statusBadge(c)}</>}
                  />
                ))}
              </Rows>
            )}
          </Widget>
        </div>
      </section>
    </Zone>
  );
}

// ------------------------------------------------------------- simple lists

function listView(
  domain: Domain, tab: Tab, b: Bundle,
  rows: Client[], title: string, accent: 'red' | 'green',
): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <LiveNote />
      <section className="grid">
        <div className="col-12">
          <Widget title={title} accent={accent} flush action={<span className="badge">{rows.length}</span>}>
            {rows.length === 0 ? <Empty>Nothing here.</Empty> : (
              <Rows>
                {rows.map((c, i) => (
                  <Row
                    key={c.id}
                    accent={accentAt(i)}
                    title={c.community}
                    sub={c.contact ?? 'No named contact'}
                    href={c.notionUrl}
                    external
                    aside={statusBadge(c)}
                  />
                ))}
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
  const wired = b.clients.filter((c) => c.mcpServer);
  const unwired = activeClients(b.clients).filter((c) => !c.mcpServer);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <LiveNote />
      <section className="grid">
        <div className="col-7">
          <Widget title="Wired to this dashboard" accent="green" flush action={<span className="badge badge--green">{wired.length}</span>}>
            {wired.length === 0 ? <Empty>None wired.</Empty> : (
              <Rows>
                {wired.map((c, i) => (
                  <Row
                    key={c.id}
                    accent={accentAt(i)}
                    icon="users"
                    title={c.community}
                    sub={c.platform ?? 'Platform unknown'}
                    href={c.notionUrl}
                    external
                    aside={statusBadge(c)}
                  />
                ))}
              </Rows>
            )}
          </Widget>
        </div>
        <div className="col-5">
          <Widget title="Active, not wired yet" accent="orange" flush action={<span className="badge badge--orange">{unwired.length}</span>}>
            {unwired.length === 0 ? <Empty>Every active client is readable.</Empty> : (
              <Rows>
                {unwired.map((c, i) => (
                  <Row key={c.id} accent={accentAt(i)} title={c.community} sub={c.platform ?? 'Platform unknown'} href={c.notionUrl} external />
                ))}
              </Rows>
            )}
            <div className="widget__foot">
              <p className="muted">A wired community can be read from here. The rest are links only.</p>
            </div>
          </Widget>
        </div>
      </section>
    </Zone>
  );
}

// ----------------------------------------------------------------- delivery

function deliveryView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const rows = activeClients(b.clients);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <LiveNote />
      <section className="grid">
        {rows.map((c, i) => {
          const tasks = b.clientTasks.filter((t) => t.clientId === c.id);
          return (
            <div className="col-4" key={c.id}>
              <Widget
                title={c.community}
                accent={accentAt(i)}
                flush
                action={tasks.length > 0 ? <span className="badge">{tasks.length}</span> : undefined}
              >
                {tasks.length === 0 ? <Empty>Clear.</Empty> : (
                  <Rows>
                    {tasks.map((t) => (
                      <Row
                        key={t.id}
                        title={t.title}
                        sub={t.status.replace('_', ' ')}
                        aside={
                          t.priority === 'high' || t.priority === 'urgent'
                            ? <Badge tone="red">{t.priority === 'urgent' ? 'Urgent' : 'High'}</Badge>
                            : undefined
                        }
                      />
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

/** One line, on every client view, so the rule stays visible. */
function LiveNote() {
  return (
    <div className="notice">
      <span className="icon-chip icon-chip--sm accent-green">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" /><path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
        </svg>
      </span>
      <div>
        <p className="row__title" style={{ fontSize: 14 }}>Live from Notion</p>
        <p className="muted" style={{ marginTop: 2 }}>
          Fetched for this page load and kept nowhere. Not in the database, not in the repository,
          not in the command palette.
        </p>
      </div>
    </div>
  );
}
