import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { ROOTS } from '@/lib/types';
import { accentAt, DOMAIN_BY_SLUG } from '@/lib/nav';
import { Widget, Stat, Row, Rows, Empty, Badge } from '@/components/ui';
import { Zone, NotWired } from '@/components/views/shared';

/**
 * The Brain — your own intelligence, made operational.
 *
 * This is the domain that stops the dashboard being a link farm. Voice rules
 * are written so a checker can apply them. Sources declare exactly what each
 * connection can reach, and which domains it feeds. Method is ROOTS, kept next
 * to the client work it describes rather than in a document nobody opens.
 */
export function brainZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  switch (tab.slug) {
    case 'voice': return voiceView(domain, tab, b);
    case 'method': return methodView(domain, tab, b);
    case 'sources': return sourcesView(domain, tab, b);
    case 'library': return libraryView(domain, tab, b);
    default: return promptsView(domain, tab, b);
  }
}

// --------------------------------------------------------------------- voice

function voiceView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const by = (kind: string) => b.voiceRules.filter((r) => r.kind === kind);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="card accent-violet" style={{ padding: 20 }}>
        <p className="eyebrow">One line</p>
        <p className="section-title" style={{ marginTop: 8 }}>
          Warm, direct, European — “the friend already inside, making the magic, waving you in.”
        </p>
        <p className="muted" style={{ marginTop: 6 }}>
          Brené Brown warmth, Aaron Dignan systems language. Every draft this dashboard produces is
          checked against the rules below before you ever see it.
        </p>
      </section>

      <section className="grid">
        <div className="col-6">
          <Widget title="Principles" accent="violet" flush action={<span className="badge">{by('principle').length}</span>}>
            <Rows>
              {by('principle').map((r, i) => (
                <Row key={r.id} accent={accentAt(i)} title={r.title} sub={r.detail} />
              ))}
            </Rows>
          </Widget>
        </div>

        <div className="col-6">
          <Widget title="Never" accent="red" flush action={<span className="badge badge--red">{by('avoid').length}</span>}>
            <Rows>
              {by('avoid').map((r, i) => (
                <Row key={r.id} accent={accentAt(i)} title={r.title} sub={r.detail} />
              ))}
            </Rows>
          </Widget>
        </div>
      </section>

      <section className="grid">
        <div className="col-7">
          <Widget title="Lexicon" accent="green">
            <div className="stack-sm">
              {by('lexicon').map((r) => (
                <div key={r.id}>
                  <p className="eyebrow">{r.title}</p>
                  <p className="muted" style={{ marginTop: 4, lineHeight: 1.6 }}>{r.detail}</p>
                </div>
              ))}
            </div>
          </Widget>
        </div>

        <div className="col-5">
          <Widget title="Stories that carry proof" accent="orange" flush>
            <Rows>
              {by('story').map((r, i) => (
                <Row key={r.id} accent={accentAt(i)} title={r.title} sub={r.detail} />
              ))}
            </Rows>
          </Widget>
        </div>
      </section>
    </Zone>
  );
}

// -------------------------------------------------------------------- method

function methodView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  // ROOTS phase is judgement about the engagement, not a CRM field — the
  // client rows carry a construction phase instead, which is different.
  const active: { id: string; name: string; rootsPhase: string | null }[] = [];

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="card accent-violet" style={{ padding: 20 }}>
        <p className="eyebrow">Big Tribe Builders</p>
        <p className="section-title" style={{ marginTop: 8 }}>ROOTS — the five pillars</p>
        <p className="muted" style={{ marginTop: 6 }}>
          You make the plan, the client or their tech team implements. Elite advisory, not delivery.
        </p>
      </section>

      <section className="grid">
        {ROOTS.map((r, i) => {
          const here = active.filter((c) => c.rootsPhase === r.key);
          return (
            <div className="col-4" key={r.key}>
              <Widget
                title={`${r.letter} — ${r.name}`}
                accent={accentAt(i)}
                flush
                action={here.length > 0 ? <span className="badge">{here.length}</span> : undefined}
              >
                <div className="widget__body">
                  <p className="muted">{r.blurb}</p>
                </div>
                {here.length > 0 ? (
                  <>
                    <hr className="divider" />
                    <Rows>
                      {here.map((c) => (
                        <Row key={c.id} title={c.name} href="/d/clients/active" />
                      ))}
                    </Rows>
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

// ------------------------------------------------------------------ sources

function sourcesView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const connected = b.brainSources.filter((s) => s.state === 'connected');
  const needsAuth = b.brainSources.filter((s) => s.state === 'needs_auth');
  const planned = b.brainSources.filter((s) => s.state === 'planned');

  const group = (title: string, rows: typeof b.brainSources, accent: 'green' | 'orange' | 'violet') => (
    <Widget title={title} accent={accent} flush action={<span className="badge">{rows.length}</span>}>
      {rows.length === 0 ? <Empty>None.</Empty> : (
        <Rows>
          {rows.map((s, i) => (
            <Row
              key={s.id}
              accent={accentAt(i)}
              icon="brain"
              title={s.name}
              sub={s.reach}
              aside={
                <span className="badge">
                  {s.feeds.map((f) => DOMAIN_BY_SLUG.get(f)?.label ?? f).slice(0, 2).join(', ')}
                  {s.feeds.length > 2 ? ` +${s.feeds.length - 2}` : ''}
                </span>
              }
            />
          ))}
        </Rows>
      )}
    </Widget>
  );

  return (
    <Zone domain={domain} tab={tab} b={b}>
      {needsAuth.length > 0 ? (
        <NotWired
          what={`${needsAuth.map((s) => s.name).join(', ')} needs authorising`}
          how="This server cannot be authorised from a background session. Connect it once from claude.ai connector settings, or an interactive session, and its reach lights up here."
        />
      ) : null}

      <section className="grid">
        <div className="col-4"><Stat label="Connected" value={connected.length} meta="Readable right now" accent="green" /></div>
        <div className="col-4"><Stat label="Needs authorising" value={needsAuth.length} meta="One-time connect" accent="orange" /></div>
        <div className="col-4"><Stat label="Planned" value={planned.length} meta="Not ingested yet" accent="violet" /></div>
      </section>

      <section className="grid">
        <div className="col-6">{group('Connected', connected, 'green')}</div>
        <div className="col-6">
          <div className="stack-sm">
            {group('Needs authorising', needsAuth, 'orange')}
            {group('Planned', planned, 'violet')}
          </div>
        </div>
      </section>
    </Zone>
  );
}

// ------------------------------------------------------------------ library

function libraryView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const corpora = b.brainSources.filter((s) => s.kind === 'corpus' || s.kind === 'graph');

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what="The library is the next real build"
        how="Books, SPI lessons and transcripts become retrievable text rather than a reading list. Each one gets a source row, so a draft can cite which book a claim came from."
      />
      <section className="grid">
        <div className="col-12">
          <Widget title="Corpora" accent="orange" flush>
            <Rows>
              {corpora.map((s, i) => (
                <Row
                  key={s.id}
                  accent={accentAt(i)}
                  icon="book"
                  title={s.name}
                  sub={s.note ?? s.reach}
                  aside={
                    <Badge tone={s.state === 'connected' ? 'green' : s.state === 'needs_auth' ? 'orange' : undefined}>
                      {s.state === 'needs_auth' ? 'needs auth' : s.state}
                    </Badge>
                  }
                />
              ))}
            </Rows>
          </Widget>
        </div>
      </section>
    </Zone>
  );
}

// ------------------------------------------------------------------ prompts

const SAVED_MOVES = [
  { id: 'p1', title: 'Draft a LinkedIn post in my voice', detail: 'Pulls a metaphor and a story from the brain, then checks the draft against every voice rule before showing it.' },
  { id: 'p2', title: 'Turn this call into client actions', detail: 'Zoom transcript in, Daily Tasks rows out, linked to the right client by sound-matching the name.' },
  { id: 'p3', title: 'Where is this client in ROOTS?', detail: 'Reads their community server and places them against the five pillars with evidence.' },
  { id: 'p4', title: 'What did I decide about this?', detail: 'Searches team memory for the decision of record before you re-litigate it.' },
  { id: 'p5', title: 'Weekly review', detail: 'Closes the week in the Goal Navigator, rolls the open work forward, drafts the next theme.' },
  { id: 'p6', title: 'Draft the proposal', detail: 'Client context plus the ROOTS phase plus your pricing, in the senior peer-to-peer tone.' },
];

function promptsView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what="Saved moves are defined here, run from Claude"
        how="Each one is a prompt plus the sources it is allowed to read. Wiring them to a button is the phase-two build once the schema settles."
      />
      <section className="grid">
        {SAVED_MOVES.map((p, i) => (
          <div className="col-4" key={p.id}>
            <div className={`card card--hover accent-${accentAt(i)}`} style={{ padding: 16, height: '100%' }}>
              <span className="icon-chip">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m13 3-8 10h6l-2 8 8-10h-6l2-8Z" />
                </svg>
              </span>
              <p className="row__title" style={{ marginTop: 12 }}>{p.title}</p>
              <p className="muted" style={{ marginTop: 4 }}>{p.detail}</p>
            </div>
          </div>
        ))}
      </section>
    </Zone>
  );
}
