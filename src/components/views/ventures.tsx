import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { ROOTS } from '@/lib/types';
import { accentAt } from '@/lib/nav';
import { Widget, Stat, Row, Rows, Empty, Badge, Progress } from '@/components/ui';
import { Zone, AppsWidget, WorkWidget, NotWired } from '@/components/views/shared';
import { shortDate } from '@/lib/data';
import { byStatus, contactsFor, fullName, platformOf, PHASE_LABEL } from '@/lib/crm';

/**
 * The three ventures.
 *
 * These are your businesses, not clients — which is why their work lives in
 * GN_tasks rather than Daily Tasks, and why they get their own rail entries
 * instead of sitting inside the CRM.
 */
export function ventureZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  if (domain.slug === 'big-tribe-builders') return btbZone(domain, tab, b);
  if (domain.slug === 'quinb-academy') return quinbZone(domain, tab, b);
  return giuliaZone(domain, tab, b);
}

// ---------------------------------------------------------------------- BTB

function btbZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  // Her own row sits in the client list so it can carry tasks; it is not an
  // engagement, so it is excluded here.
  const active = byStatus(b.companies, 'active').filter((c) => c.id !== 'big-tribe-builders');
  const pipeline = byStatus(b.companies, 'contact');

  if (tab.slug === 'pulse') {
    return (
      <Zone domain={domain} tab={tab} b={b}>
        <section className="card accent-violet" style={{ padding: 20 }}>
          <p className="eyebrow">The firm</p>
          <p className="page-title" style={{ marginTop: 8 }}>Build big. Stay human.</p>
          <p className="muted" style={{ marginTop: 6, maxWidth: 620 }}>
            Elite advisory for people who already have large communities. You create the plans and
            the strategy; the client or their tech team implements. You are the community architect.
          </p>
        </section>

        <section className="grid">
          <div className="col-3"><Stat label="Engagements" value={active.length} meta="Live advisory work" accent="violet" href="/d/clients/active" /></div>
          <div className="col-3"><Stat label="Pipeline" value={pipeline.length} meta="Conversations open" accent="red" href="/d/clients/pipeline" /></div>
          <div className="col-3"><Stat label="Communities" value={b.companies.filter((c) => c.communityUrl).length} meta="Platforms you touch" accent="green" href="/d/clients/communities" /></div>
          <div className="col-3"><Stat label="Open client work" value={b.clientTasks.length} meta="From Daily Tasks" accent="orange" /></div>
        </section>

        <section className="grid">
          <div className="col-7">
            <Widget title="Engagements" accent="violet" flush>
              <Rows>
                {active.map((c, i) => (
                  <Row
                    key={c.id}
                    accent={accentAt(i)}
                    icon="users"
                    title={c.name}
                    sub={[contactsFor(b.contacts, c.id).map(fullName)[0], platformOf(c)].filter(Boolean).join(' · ')}
                    href={`/d/clients/active/${c.id}`}
                  />
                ))}
              </Rows>
            </Widget>
          </div>
          <div className="col-5"><WorkWidget domain={domain} b={b} title="Firm work" /></div>
        </section>
      </Zone>
    );
  }

  if (tab.slug === 'roots') {
    // Two different things, deliberately kept apart. ROOTS is the method you
    // sell. `construction phase` is what each engagement is actually in, and
    // it comes from the client row. Mapping one onto the other would be my
    // guess presented as your framework, so both are shown as they are.
    const phases = new Map<string, typeof active>();
    for (const c of active) {
      if (!c.phase) continue;
      phases.set(c.phase, [...(phases.get(c.phase) ?? []), c]);
    }
    const unphased = active.filter((c) => !c.phase);

    return (
      <Zone domain={domain} tab={tab} b={b}>
        <section className="card accent-violet" style={{ padding: 20 }}>
          <p className="eyebrow">The method</p>
          <p className="section-title" style={{ marginTop: 8 }}>ROOTS — the five pillars</p>
          <p className="muted" style={{ marginTop: 6, maxWidth: 640 }}>
            You make the plan, the client or their tech team implements. Elite advisory, not
            delivery.
          </p>
        </section>

        <section className="grid">
          {ROOTS.map((r, i) => (
            <div className="col-4" key={r.key}>
              <Widget title={`${r.letter} — ${r.name}`} accent={accentAt(i)}>
                <p className="muted">{r.blurb}</p>
              </Widget>
            </div>
          ))}
        </section>

        <section>
          <div className="hstack" style={{ marginBottom: 12 }}>
            <h2 className="section-title">Where the live engagements actually are</h2>
            <div className="spacer" />
            <span className="muted">construction phase, from the client record</span>
          </div>
          <div className="grid">
            {[...phases.entries()].map(([phase, rows], i) => (
              <div className="col-4" key={phase}>
                <Widget
                  title={PHASE_LABEL[phase as keyof typeof PHASE_LABEL] ?? phase}
                  accent={accentAt(i)}
                  flush
                  action={<span className="badge">{rows.length}</span>}
                >
                  <Rows>
                    {rows.map((c, j) => (
                      <Row key={c.id} accent={accentAt(j)} title={c.name} href={`/d/clients/active/${c.id}`} />
                    ))}
                  </Rows>
                </Widget>
              </div>
            ))}
            {unphased.length > 0 ? (
              <div className="col-4">
                <Widget title="No phase set" accent={accentAt(phases.size)} flush action={<span className="badge">{unphased.length}</span>}>
                  <Rows>
                    {unphased.map((c, j) => (
                      <Row key={c.id} accent={accentAt(j)} title={c.name} href={`/d/clients/active/${c.id}`} />
                    ))}
                  </Rows>
                </Widget>
              </div>
            ) : null}
          </div>
        </section>
      </Zone>
    );
  }

  if (tab.slug === 'engagements') {
    return (
      <Zone domain={domain} tab={tab} b={b}>
        <section className="grid">
          <div className="col-12">
            <Widget title="Live advisory work" accent="violet" flush action={<span className="badge">{active.length}</span>}>
              <Rows>
                {active.map((c, i) => (
                  <Row
                    key={c.id}
                    accent={accentAt(i)}
                    icon="users"
                    title={c.name}
                    sub={[contactsFor(b.contacts, c.id).map(fullName).join(', '), c.notes].filter(Boolean).join(' · ')}
                    href={`/d/clients/active/${c.id}`}
                  />
                ))}
              </Rows>
            </Widget>
          </div>
        </section>
      </Zone>
    );
  }

  if (tab.slug === 'pipeline') {
    return (
      <Zone domain={domain} tab={tab} b={b}>
        <NotWired
          what="Calls and proposals are tracked in Notion"
          how="The single CTA is 'Book a free 30-min call'. Wiring the calendar into this zone would show booked calls next to the pipeline rows."
        />
        <section className="grid">
          <div className="col-12">
            <Widget title="Open conversations" accent="red" flush action={<span className="badge">{pipeline.length}</span>}>
              <Rows>
                {pipeline.slice(0, 12).map((c, i) => (
                  <Row key={c.id} accent={accentAt(i)} title={c.name} sub={contactsFor(b.contacts, c.id).map(fullName).join(', ') || '—'} href={`/d/clients/pipeline/${c.id}`} />
                ))}
              </Rows>
              <div className="widget__foot">
                <p className="muted">Showing 12 of {pipeline.length}. <a className="link" href="/d/clients/pipeline">All pipeline</a></p>
              </div>
            </Widget>
          </div>
        </section>
      </Zone>
    );
  }

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what="The asset library is not built yet"
        how="Decks, blueprints and playbooks currently live in Drive and Notion. Giving them rows here means they can be attached to an engagement and reused."
      />
      <section className="grid">
        <div className="col-7"><WorkWidget domain={domain} b={b} /></div>
        <div className="col-5"><AppsWidget domain={domain} b={b} /></div>
      </section>
    </Zone>
  );
}

// -------------------------------------------------------------------- QuinB

function quinbZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="card accent-red" style={{ padding: 20 }}>
        <p className="eyebrow">The academy</p>
        <p className="section-title" style={{ marginTop: 8 }}>A host&rsquo;s home base</p>
        <p className="muted" style={{ marginTop: 6, maxWidth: 620 }}>
          Not DIY education. Resources, courses and live meetups — and most of all, the room where
          outstanding hosts meet each other.
        </p>
      </section>

      <NotWired
        what="QuinB is not wired to a server yet"
        how="Your five client communities already are. Adding QuinB's own Mighty Networks server would put members, events and revenue on this page the same way."
      />

      <section className="grid">
        <div className="col-7"><WorkWidget domain={domain} b={b} title="Academy work" /></div>
        <div className="col-5"><AppsWidget domain={domain} b={b} /></div>
      </section>
    </Zone>
  );
}

// --------------------------------------------------------------- Giulia May

const CHAPTERS = 15;

function giuliaZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  if (tab.slug === 'book') {
    // Chapter count comes from the BTB brain: a 15-chapter manuscript.
    const written = 8;
    return (
      <Zone domain={domain} tab={tab} b={b}>
        <section className="card accent-green" style={{ padding: 20 }}>
          <p className="eyebrow">The book</p>
          <p className="section-title" style={{ marginTop: 8 }}>Big Tribe Builders</p>
          <div className="hstack" style={{ marginTop: 14, gap: 16 }}>
            <span className="muted tnum">{written} of {CHAPTERS} chapters</span>
            <span style={{ flex: 1, maxWidth: 320 }}><Progress value={Math.round((written / CHAPTERS) * 100)} /></span>
            <span className="badge badge--orange">launches ~end 2026</span>
          </div>
        </section>

        <section className="grid">
          <div className="col-7"><WorkWidget domain={domain} b={b} title="Book work" /></div>
          <div className="col-5">
            <Widget title="Where the material lives" accent="violet" flush>
              <Rows>
                {b.brainSources.filter((s) => s.feeds.includes('giulia-may')).map((s, i) => (
                  <Row
                    key={s.id}
                    accent={accentAt(i)}
                    icon="brain"
                    title={s.name}
                    sub={s.reach}
                    href="/d/brain/sources"
                    aside={<Badge tone={s.state === 'connected' ? 'green' : 'orange'}>{s.state === 'needs_auth' ? 'needs auth' : s.state}</Badge>}
                  />
                ))}
              </Rows>
            </Widget>
          </div>
        </section>
      </Zone>
    );
  }

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what={`${tab.label} is not wired yet`}
        how="giuliamay.com is an authority hub, not a funnel — the useful numbers here are speaking invitations and newsletter growth. Kit is already connected and can supply the second."
      />
      <section className="grid">
        <div className="col-7"><WorkWidget domain={domain} b={b} /></div>
        <div className="col-5"><AppsWidget domain={domain} b={b} /></div>
      </section>
    </Zone>
  );
}
