import Link from 'next/link';
import {
  getSignals, getTasks, getApps, getContent, getGoals,
  dueBy, openTasks, pinnedApps, tasksForDomain,
  today, greeting, shortDate, relativeDay,
} from '@/lib/data';
import { Widget, Stat, Row, Rows, Empty, Badge, Progress, PageHead, Launcher, SourceNote } from '@/components/ui';
import { accentAt, DOMAIN_BY_SLUG, DOMAINS } from '@/lib/nav';

/**
 * The Command Center.
 *
 * One rule governs this page: it answers "what needs me right now?" before it
 * answers anything else. If a widget would not change a decision in the next
 * hour, it does not belong here.
 *
 * No client appears on this page. Client work is real work and it does need
 * doing — but it is read live from Notion and it lives in the Clients zone,
 * not spread across the overarching environment. What surfaces here is the
 * one line saying whether that connection is up.
 *
 * Reading order, top to bottom:
 *   1. Needs you    — the short list, ordered by cost of waiting
 *   2. Today        — her own dated work
 *   3. The numbers  — four tiles, each a link into its domain
 *   4. Ventures / going out — the two things that move the business
 *   5. Jump back in — the apps, because leaving is a legitimate action
 */
export default async function CommandCenter() {
  const [
    { rows: signals }, { rows: tasks, source, error },
    { rows: apps }, { rows: content }, { rows: goals },
  ] = await Promise.all([
    getSignals(), getTasks(), getApps(), getContent(), getGoals(),
  ]);

  const now = today();
  const due = dueBy(tasks, now);
  const open = openTasks(tasks);
  const week = goals.find((g) => g.tier === 'week');
  const quarter = goals.find((g) => g.tier === 'quarter');
  const ranked = [...signals].sort((a, b) => b.weight - a.weight);

  const goingOut = content
    .filter((c) => c.state === 'scheduled' || c.state === 'review' || c.state === 'drafting')
    .slice(0, 5);

  const ventures = DOMAINS.filter((d) => d.group === 'Ventures');

  return (
    <main className="content content--wide stack">
      <PageHead
        title={`${greeting()}, Giulia`}
        blurb={week ? `${shortDate(now)} · ${week.title}` : shortDate(now)}
        actions={
          <>
            <button type="button" className="btn btn--primary" data-open-palette>Jump to anything</button>
            <Link className="btn btn--ghost" href="/launchpad">Launchpad</Link>
          </>
        }
      />

      <SourceNote source={source} error={error} />

      {/* 1. Needs you ------------------------------------------------------ */}
      <section className="grid">
        <div className="col-7">
          <Widget
            title="Needs you"
            accent="red"
            flush
            action={<span className="badge badge--red">{ranked.length}</span>}
          >
            {ranked.length === 0 ? (
              <Empty>Nothing is blocked. Rare — enjoy it.</Empty>
            ) : (
              <Rows>
                {ranked.map((s, i) => {
                  const d = DOMAIN_BY_SLUG.get(s.domain);
                  return (
                    <Row
                      key={s.id}
                      accent={accentAt(i)}
                      icon={d?.icon}
                      title={s.title}
                      sub={s.detail}
                      href={s.href}
                      aside={<span className="badge">{d?.label ?? s.domain}</span>}
                    />
                  );
                })}
              </Rows>
            )}
          </Widget>
        </div>

        {/* 2. Today -------------------------------------------------------- */}
        <div className="col-5">
          <Widget title="Today" accent="violet" flush action={<span className="badge">{due.length}</span>}>
            {due.length === 0 ? (
              <Empty>Nothing dated today.</Empty>
            ) : (
              <Rows>
                {due.map((t, i) => {
                  const rel = relativeDay(t.dueDate ?? t.doDate, now);
                  return (
                    <Row
                      key={t.id}
                      accent={accentAt(i)}
                      title={t.title}
                      sub={t.area ?? 'Personal'}
                      href={`/d/${t.domain}`}
                      aside={
                        <>
                          {t.priority === 'urgent' || t.priority === 'high'
                            ? <Badge tone="red">{t.priority === 'urgent' ? 'Urgent' : 'High'}</Badge>
                            : null}
                          {rel ? <span className="badge">{rel}</span> : null}
                        </>
                      }
                    />
                  );
                })}
              </Rows>
            )}
            <div className="widget__foot">
              <p className="muted">
                Your own work. Client work is in <Link className="link" href="/d/clients/active">Clients</Link>.
              </p>
            </div>
          </Widget>
        </div>
      </section>

      {/* 3. The numbers --------------------------------------------------- */}
      <section className="grid">
        <div className="col-3">
          <Stat label="Open work" value={open.length} meta="Your own, across every area" accent="violet" />
        </div>
        <div className="col-3">
          <Stat label="Going out" value={content.filter((c) => c.state !== 'published').length} meta="Idea to scheduled" accent="red" href="/d/content/pipeline" />
        </div>
        <div className="col-3">
          <Stat label="This week" value={week ? `${week.progress ?? 0}%` : '—'} meta={week?.title.split('|')[1]?.trim() ?? 'No week theme set'} accent="green" />
        </div>
        <div className="col-3">
          <Stat label="This quarter" value={quarter ? `${quarter.progress ?? 0}%` : '—'} meta={quarter?.title.split('|')[1]?.trim() ?? 'No quarter theme set'} accent="orange" />
        </div>
      </section>

      {/* 4. Ventures and content ------------------------------------------ */}
      <section className="grid">
        <div className="col-6">
          <Widget title="Your ventures" accent="green" flush>
            <Rows>
              {ventures.map((d, i) => {
                const n = tasksForDomain(tasks, d.slug).length;
                return (
                  <Row
                    key={d.slug}
                    accent={accentAt(i)}
                    icon={d.icon}
                    title={d.label}
                    sub={d.blurb}
                    href={`/d/${d.slug}/${d.tabs[0].slug}`}
                    aside={n > 0 ? <span className="badge">{n} open</span> : undefined}
                  />
                );
              })}
            </Rows>
          </Widget>
        </div>

        <div className="col-6">
          <Widget
            title="Going out"
            accent="orange"
            flush
            action={<Link className="btn btn--quiet" href="/d/content/pipeline">Pipeline</Link>}
          >
            {goingOut.length === 0 ? (
              <Empty>Nothing queued. That is the thing to fix.</Empty>
            ) : (
              <Rows>
                {goingOut.map((c, i) => (
                  <Row
                    key={c.id}
                    accent={accentAt(i)}
                    icon="megaphone"
                    title={c.title}
                    sub={`${c.channel}${c.campaign ? ` · ${c.campaign}` : ''}`}
                    href="/d/content/pipeline"
                    aside={
                      <span className={`badge${c.state === 'review' ? ' badge--orange' : ''}`}>
                        {c.state === 'review' ? 'Needs you' : c.state}
                      </span>
                    }
                  />
                ))}
              </Rows>
            )}
          </Widget>
        </div>
      </section>

      {/* Week progress ----------------------------------------------------- */}
      {week ? (
        <section className="card accent-violet" style={{ padding: 20 }}>
          <p className="eyebrow">This week</p>
          <div className="hstack" style={{ marginTop: 10, gap: 16 }}>
            <p className="section-title" style={{ flex: 1, minWidth: 0 }}>{week.title}</p>
            <span className="muted tnum">{week.progress ?? 0}%</span>
            <span style={{ width: 180 }}><Progress value={week.progress ?? 0} /></span>
          </div>
        </section>
      ) : null}

      {/* 5. Jump back in --------------------------------------------------- */}
      <section>
        <div className="hstack" style={{ marginBottom: 12 }}>
          <h2 className="section-title">Jump back in</h2>
          <div className="spacer" />
          <Link className="btn btn--quiet" href="/launchpad">Everything</Link>
        </div>
        <Launcher apps={pinnedApps(apps)} />
      </section>
    </main>
  );
}
