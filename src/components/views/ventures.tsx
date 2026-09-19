import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { ROOTS } from '@/lib/types';
import { accentAt } from '@/lib/nav';
import { Widget, Stat, Row, Rows, Empty, Badge, Progress } from '@/components/ui';
import { Zone, AppsWidget, WorkWidget, NotWired } from '@/components/views/shared';
import { activeClients, pipelineClients, shortDate } from '@/lib/data';

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
  const active = activeClients(b.clients).filter((c) => c.venture === 'btb' && c.id !== 'big-tribe-builders');
  const pipeline = pipelineClients(b.clients);

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
          <div className="col-3"><Stat label="Wired communities" value={b.clients.filter((c) => c.mcpServer).length} meta="Readable from here" accent="green" href="/d/clients/communities" /></div>
          <div className="col-3"><Stat label="Open work" value={b.tasks.filter((t) => t.status !== 'done' && t.clientId).length} meta="Across all clients" accent="orange" /></div>
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
                    title={c.community}
                    sub={[c.contact, ROOTS.find((r) => r.key === c.rootsPhase)?.name].filter(Boolean).join(' · ')}
                    href="/d/clients/active"
                    aside={c.openTasks > 0 ? <Badge tone="orange">{c.openTasks}</Badge> : undefined}
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
    return (
      <Zone domain={domain} tab={tab} b={b}>
        <section className="grid">
          {ROOTS.map((r, i) => {
            const here = active.filter((c) => c.rootsPhase === r.key);
            return (
              <div className="col-4" key={r.key}>
                <Widget title={`${r.letter} — ${r.name}`} accent={accentAt(i)} flush action={here.length ? <span className="badge">{here.length}</span> : undefined}>
                  <div className="widget__body"><p className="muted">{r.blurb}</p></div>
                  {here.length > 0 ? (
                    <>
                      <hr className="divider" />
                      <Rows>{here.map((c) => <Row key={c.id} title={c.community} sub={c.contact ?? undefined} href="/d/clients/active" />)}</Rows>
                    </>
                  ) : null}
                </Widget>
              </div>
            );
          })}
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
                    title={c.community}
                    sub={[c.contact, c.notes, c.lastTouch ? `last touch ${shortDate(c.lastTouch)}` : null].filter(Boolean).join(' · ')}
                    href={c.notionUrl}
                    external
                    aside={<Badge>{ROOTS.find((r) => r.key === c.rootsPhase)?.letter ?? '—'}</Badge>}
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
                  <Row key={c.id} accent={accentAt(i)} title={c.community} sub={c.contact ?? '—'} href={c.notionUrl} external />
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
