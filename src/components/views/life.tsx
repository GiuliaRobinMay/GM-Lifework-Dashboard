import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { accentAt } from '@/lib/nav';
import { Widget, Stat, Row, Rows, Empty, Badge, Progress } from '@/components/ui';
import { Zone, AppsWidget, WorkWidget, NotWired } from '@/components/views/shared';
import { tasksForDomain } from '@/lib/data';

/**
 * Studying, Fitness, Accountancy — the Goal Navigator domains.
 *
 * All three read GN_tasks, filtered by `area`. They are small on purpose:
 * the cost of these areas is not that they are complicated, it is that they
 * are invisible when client work is loud. One honest widget each beats a
 * dashboard nobody trusts.
 */
export function lifeZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  if (domain.slug === 'studying') return studyingZone(domain, tab, b);
  if (domain.slug === 'fitness') return fitnessZone(domain, tab, b);
  return accountancyZone(domain, tab, b);
}

// ----------------------------------------------------------------- studying

function studyingZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const studying = b.courses.filter((c) => c.state === 'studying');
  const next = studying[0];

  if (tab.slug === 'next') {
    return (
      <Zone domain={domain} tab={tab} b={b}>
        {next ? (
          <section className="card card--hover accent-violet" style={{ padding: 20 }}>
            <p className="eyebrow">Next up</p>
            <div className="hstack" style={{ gap: 16, marginTop: 12 }}>
              <span className="icon-chip icon-chip--lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4.5h9a3 3 0 0 1 3 3V21a3 3 0 0 0-3-3H4V4.5Z" /><path d="M20 4.5h-2a3 3 0 0 0-3 3V21a3 3 0 0 1 3-3h2V4.5Z" />
                </svg>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="section-title">{next.nextLesson ?? next.title}</p>
                <p className="muted" style={{ marginTop: 2 }}>
                  {next.title} · {next.provider} · {next.lessonsDone}/{next.lessonsTotal} done
                </p>
              </div>
              {next.url ? (
                <a className="btn btn--primary" href={next.url} target="_blank" rel="noreferrer">Start</a>
              ) : null}
            </div>
          </section>
        ) : <Empty>Nothing in progress.</Empty>}

        <section className="grid">
          <div className="col-7"><WorkWidget domain={domain} b={b} title="Study tasks" /></div>
          <div className="col-5"><AppsWidget domain={domain} b={b} /></div>
        </section>
      </Zone>
    );
  }

  if (tab.slug === 'courses') {
    const groups: [string, typeof b.courses][] = [
      ['Studying', b.courses.filter((c) => c.state === 'studying')],
      ['To study', b.courses.filter((c) => c.state === 'to_study')],
      ['Done', b.courses.filter((c) => c.state === 'done')],
    ];
    return (
      <Zone domain={domain} tab={tab} b={b}>
        <section className="grid">
          {groups.map(([label, rows], gi) => (
            <div className="col-4" key={label}>
              <Widget title={label} accent={accentAt(gi)} flush action={<span className="badge">{rows.length}</span>}>
                {rows.length === 0 ? <Empty>None.</Empty> : (
                  <Rows>
                    {rows.map((c) => (
                      <Row
                        key={c.id}
                        title={c.title}
                        sub={`${c.provider} · ${c.lessonsDone}/${c.lessonsTotal}`}
                        href={c.url}
                        external={Boolean(c.url)}
                        aside={
                          c.state === 'done'
                            ? <Badge tone="green">Done</Badge>
                            : <span style={{ width: 56, display: 'inline-block' }}>
                                <Progress value={Math.round((c.lessonsDone / c.lessonsTotal) * 100)} />
                              </span>
                        }
                      />
                    ))}
                  </Rows>
                )}
              </Widget>
            </div>
          ))}
        </section>
      </Zone>
    );
  }

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what={tab.slug === 'notes' ? 'Notes are not ingested yet' : 'Lesson-to-work links are the next build'}
        how={
          tab.slug === 'notes'
            ? 'Once SPI lessons are a corpus in the Brain, your notes sit beside the source and can be cited in drafts.'
            : 'The useful move is turning a lesson into a real task on a real client. That link needs the corpus first.'
        }
      />
      <section className="grid">
        <div className="col-7"><WorkWidget domain={domain} b={b} /></div>
        <div className="col-5"><AppsWidget domain={domain} b={b} /></div>
      </section>
    </Zone>
  );
}

// ------------------------------------------------------------------ fitness

function fitnessZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const rows = tasksForDomain(b.tasks, 'fitness');
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what="Fitness reads GN_tasks, area = Sports"
        how="Deliberately thin. A count she trusts beats a chart she does not — Strava is one click away for the detail."
      />
      <section className="grid">
        <div className="col-4"><Stat label="Open this week" value={rows.length} meta="From the Goal Navigator" accent="red" /></div>
        <div className="col-8"><WorkWidget domain={domain} b={b} title="Sports" /></div>
      </section>
      <section className="grid">
        <div className="col-12"><AppsWidget domain={domain} b={b} /></div>
      </section>
    </Zone>
  );
}

// -------------------------------------------------------------- accountancy

function accountancyZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const rows = tasksForDomain(b.tasks, 'accountancy');
  const dated = rows.filter((t) => t.dueDate);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what="Money numbers are not connected yet"
        how="Invoices and VAT deadlines live in GN_tasks today, under Admin & Business. Stripe and the bookkeeping tool are links until there is a reason to sync them."
      />
      <section className="grid">
        <div className="col-4"><Stat label="Open items" value={rows.length} meta="Admin & Business" accent="green" /></div>
        <div className="col-4"><Stat label="With a deadline" value={dated.length} meta="Dated, so they bite" accent="orange" /></div>
        <div className="col-4"><Stat label="Urgent" value={rows.filter((t) => t.priority === 'urgent').length} meta="Carries a fine if missed" accent="red" /></div>
      </section>
      <section className="grid">
        <div className="col-7"><WorkWidget domain={domain} b={b} title="Money work" /></div>
        <div className="col-5"><AppsWidget domain={domain} b={b} /></div>
      </section>
    </Zone>
  );
}
