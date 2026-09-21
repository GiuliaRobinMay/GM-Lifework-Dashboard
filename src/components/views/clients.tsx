import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import type { Company } from '@/lib/crm';
import {
  STATUS_LABEL, PHASE_LABEL, fullName, contactsFor, appsFor, companyLinks, platformOf,
} from '@/lib/crm';
import { Widget, Rows, Row, Empty, Badge } from '@/components/ui';
import { Zone } from '@/components/views/shared';
import { ClientTable } from '@/components/ClientTable';

/**
 * Clients.
 *
 * One table, every client, grouped by status in Notion's order. Done and
 * archived start folded so the three she works from are what she sees.
 * The name opens the detail page; the status cell moves the row.
 */
export function clientsZone(domain: Domain, tab: Tab, b: Bundle, q = ''): ReactNode {
  if (!b.crmConnected) return notConnected(domain, tab, b);
  return listView(domain, tab, b, q);
}

// ------------------------------------------------------------------- list

function listView(domain: Domain, tab: Tab, b: Bundle, q: string): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      {b.companies.length === 0 ? (
        <Empty>No clients in the database yet.</Empty>
      ) : (
        <section className="card ctable__wrap">
          <ClientTable companies={b.companies} contacts={b.contacts} q={q} />
        </section>
      )}
    </Zone>
  );
}

// ----------------------------------------------------------------- detail

export function companyDetail(c: Company, b: Bundle): ReactNode {
  const people = contactsFor(b.contacts, c.id);
  const apps = appsFor(b.clientApps, c.id);
  const links = companyLinks(c);

  return (
    <main className="content content--wide stack">
      <div className="pagehead">
        <div className="pagehead__text">
          <p><Link href="/d/clients/all" className="backlink">← All clients</Link></p>
          <h1 className="page-title">{c.name}</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            {[c.legalName, platformOf(c), c.phase ? PHASE_LABEL[c.phase] : null]
              .filter(Boolean).join(' · ') || 'No further details recorded.'}
          </p>
        </div>
        <div className="pagehead__actions">
          <span className={`status status--${c.status}`}>{STATUS_LABEL[c.status]}</span>
        </div>
      </div>

      <Widget title="Details" accent="orange">
        <dl className="facts">
          <Fact label="Status"><span className={`status status--${c.status}`}>{STATUS_LABEL[c.status]}</span></Fact>
          <Fact label="Phase">{c.phase ? PHASE_LABEL[c.phase] : '—'}</Fact>
          <Fact label="Priority">{c.priority ?? '—'}</Fact>
          <Fact label="Source">{c.source}</Fact>
          <Fact label="Platform">{platformOf(c) ?? '—'}</Fact>
          <Fact label="Legal name">{c.legalName ?? '—'}</Fact>
          <Fact label="Running">
            {[c.hasAutomations && 'Automations', c.hasContentBot && 'Content bot', c.hasCm && 'CM',
              c.inMighty && 'In Mighty', c.inKit && 'In Kit'].filter(Boolean).join(' · ') || '—'}
          </Fact>
          <Fact label="Notion">{c.notionUrl ? <a href={c.notionUrl} target="_blank" rel="noreferrer">Open ↗</a> : '—'}</Fact>
        </dl>
      </Widget>

      <Widget title="People" accent="violet" flush>
        {people.length === 0 ? <Empty>No contact recorded.</Empty> : (
          <Rows>
            {people.map((p) => (
              <Row
                key={p.id}
                title={fullName(p)}
                sub={[p.role, p.email, p.phone].filter(Boolean).join(' · ') || null}
                aside={
                  <>
                    {p.isPrimary ? <Badge tone="green">Primary</Badge> : null}
                    {p.needsCheck ? <Badge tone="orange">Check name</Badge> : null}
                  </>
                }
              />
            ))}
          </Rows>
        )}
      </Widget>

      <Widget title="Open" accent="orange" flush>
        {links.length === 0 ? <Empty>No links recorded.</Empty> : (
          <Rows>
            {links.map((l) => (
              <Row key={l.url} title={l.label} sub={l.url} href={l.url} external />
            ))}
          </Rows>
        )}
      </Widget>

      <Widget title="Built for them" accent="green" flush>
        {apps.length === 0 ? <Empty>Nothing recorded yet.</Empty> : (
          <Rows>
            {apps.map((a) => (
              <Row
                key={a.id}
                title={a.name}
                sub={[a.description, a.host].filter(Boolean).join(' · ') || null}
                href={a.liveUrl}
                external
                aside={<Badge>{a.state}</Badge>}
              />
            ))}
          </Rows>
        )}
      </Widget>

      {c.notes || c.remarks ? (
        <Widget title="Notes" accent="violet">
          {c.notes ? <p style={{ lineHeight: 1.65 }}>{c.notes}</p> : null}
          {c.remarks ? <p className="muted" style={{ marginTop: 8, lineHeight: 1.65 }}>{c.remarks}</p> : null}
        </Widget>
      ) : null}
    </main>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="facts__item">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// ---------------------------------------------------------- not connected

function notConnected(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="card" style={{ padding: 24 }}>
        <p className="section-title">No clients to show</p>
        <p className="muted" style={{ marginTop: 8, lineHeight: 1.65, maxWidth: 620 }}>
          The database is reachable but returned nothing, or the connection is not
          configured. The note above this card says which.
        </p>
      </section>
    </Zone>
  );
}
