import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import type { Company, Contact } from '@/lib/crm';
import {
  STATUS_LABEL, STATUS_ORDER, STATUS_TONE, PHASE_LABEL, fullName,
  contactsFor, primaryContact, appsFor, companyLinks, platformOf, goLinks,
} from '@/lib/crm';
import { Widget, Rows, Row, Empty, Badge } from '@/components/ui';
import { Zone } from '@/components/views/shared';

/**
 * Clients.
 *
 * One list, every client, past and present. Status is a column rather than a
 * tab: splitting them across Active / Pipeline / Archive meant the client you
 * were looking for was usually behind a tab you were not on.
 *
 * Each line answers the three things she opens this page for — who they are,
 * who she talks to, and where to go — so the row carries the community and
 * Upwork links directly. The name opens the detail page.
 */
export function clientsZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  if (!b.crmConnected) return notConnected(domain, tab, b);
  return listView(domain, tab, b);
}

// ------------------------------------------------------------------- list

function listView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const rows = [...b.companies].sort((a, c) => {
    const s = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(c.status);
    return s !== 0 ? s : a.name.localeCompare(c.name);
  });

  const counts = STATUS_ORDER
    .map((s) => ({ status: s, n: rows.filter((r) => r.status === s).length }))
    .filter((x) => x.n > 0);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <div className="hstack" style={{ gap: 8, flexWrap: 'wrap' }}>
        <Badge>{rows.length} clients</Badge>
        {counts.map(({ status, n }) => (
          <Badge key={status} tone={STATUS_TONE[status]}>
            {STATUS_LABEL[status]} {n}
          </Badge>
        ))}
      </div>

      {rows.length === 0 ? (
        <Empty>No clients in the database yet.</Empty>
      ) : (
        <section className="card">
          <div className="rows">
            {rows.map((c) => (
              <ClientLine key={c.id} company={c} contacts={b.contacts} />
            ))}
          </div>
        </section>
      )}
    </Zone>
  );
}

/**
 * One client.
 *
 * Not the shared <Row>: the community and Upwork links are their own anchors,
 * and an anchor inside a link is invalid, so the name is the only thing that
 * navigates.
 */
function ClientLine({ company, contacts }: { company: Company; contacts: Contact[] }) {
  const who = primaryContact(contacts, company.id);
  const others = contactsFor(contacts, company.id).length - 1;
  const links = goLinks(company);

  return (
    <div className="row clientline">
      <div className="clientline__name">
        <Link href={`/d/clients/all/${company.id}`} className="row__title clientline__link">
          {company.name}
        </Link>
      </div>

      <div className="clientline__who muted">
        {who ? fullName(who) : '—'}
        {others > 0 ? <span className="badge" style={{ marginLeft: 6 }}>+{others}</span> : null}
      </div>

      <div className="clientline__status">
        <Badge tone={STATUS_TONE[company.status]}>{STATUS_LABEL[company.status]}</Badge>
      </div>

      <div className="clientline__go">
        {links.map((l) => (
          <a key={l.url} className="golink" href={l.url} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </div>
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
          <p className="eyebrow">
            <Link href="/d/clients/all" className="clientline__link">← All clients</Link>
          </p>
          <h1 className="page-title">{c.name}</h1>
          <p className="muted" style={{ marginTop: 4 }}>
            {[c.legalName, platformOf(c), c.phase ? PHASE_LABEL[c.phase] : null]
              .filter(Boolean).join(' · ') || 'No further details recorded.'}
          </p>
        </div>
        <div className="pagehead__actions">
          <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>
        </div>
      </div>

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
