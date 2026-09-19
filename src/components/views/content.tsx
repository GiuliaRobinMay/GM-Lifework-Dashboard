import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import type { ContentItem } from '@/lib/types';
import { accentAt } from '@/lib/nav';
import { Widget, Stat, Row, Rows, Empty, Badge } from '@/components/ui';
import { Zone, AppsWidget, NotWired } from '@/components/views/shared';
import { shortDate } from '@/lib/data';

/**
 * Content & Social — one pipeline, every channel.
 *
 * The point of putting this next to the Brain rather than inside a scheduling
 * tool: a draft is written from your voice rules and your stories, not from a
 * generic model. The channel is the last decision, not the first.
 */
export function contentZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  switch (tab.slug) {
    case 'today': return todayView(domain, tab, b);
    case 'pipeline': return pipelineView(domain, tab, b);
    case 'channels': return channelsView(domain, tab, b);
    case 'campaigns': return campaignsView(domain, tab, b);
    default: return voiceView(domain, tab, b);
  }
}

const STATES: ContentItem['state'][] = ['idea', 'drafting', 'review', 'scheduled', 'published'];

function stateBadge(s: ContentItem['state']) {
  if (s === 'review') return <Badge tone="orange">Needs you</Badge>;
  if (s === 'scheduled') return <Badge tone="green">Scheduled</Badge>;
  if (s === 'published') return <Badge tone="green">Published</Badge>;
  return <Badge>{s}</Badge>;
}

function todayView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const needsYou = b.content.filter((c) => c.state === 'review');
  const scheduled = b.content.filter((c) => c.state === 'scheduled');

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="grid">
        <div className="col-3"><Stat label="Needs approving" value={needsYou.length} meta="Written, waiting on you" accent="orange" /></div>
        <div className="col-3"><Stat label="Scheduled" value={scheduled.length} meta="Queued and safe" accent="green" /></div>
        <div className="col-3"><Stat label="In the pipeline" value={b.content.filter((c) => c.state !== 'published').length} meta="Idea to scheduled" accent="violet" /></div>
        <div className="col-3"><Stat label="Published" value={b.content.filter((c) => c.state === 'published').length} meta="Out the door" accent="red" /></div>
      </section>

      <section className="grid">
        <div className="col-7">
          <Widget title="Waiting on you" accent="orange" flush action={<span className="badge badge--orange">{needsYou.length}</span>}>
            {needsYou.length === 0 ? <Empty>Nothing to approve.</Empty> : (
              <Rows>
                {needsYou.map((c, i) => (
                  <Row
                    key={c.id}
                    accent={accentAt(i)}
                    icon="megaphone"
                    title={c.title}
                    sub={`${c.channel}${c.campaign ? ` · ${c.campaign}` : ''}${c.scheduledFor ? ` · ${shortDate(c.scheduledFor)}` : ''}`}
                    aside={stateBadge(c.state)}
                  />
                ))}
              </Rows>
            )}
          </Widget>
        </div>

        <div className="col-5">
          <Widget title="Queued" accent="green" flush action={<span className="badge">{scheduled.length}</span>}>
            {scheduled.length === 0 ? <Empty>Nothing queued.</Empty> : (
              <Rows>
                {scheduled.map((c, i) => (
                  <Row key={c.id} accent={accentAt(i)} title={c.title} sub={`${c.channel} · ${shortDate(c.scheduledFor)}`} />
                ))}
              </Rows>
            )}
          </Widget>
        </div>
      </section>

      <section className="grid">
        <div className="col-12"><AppsWidget domain={domain} b={b} title="Post from" /></div>
      </section>
    </Zone>
  );
}

function pipelineView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="grid">
        {STATES.map((s, i) => {
          const rows = b.content.filter((c) => c.state === s);
          return (
            <div className="col-4" key={s}>
              <Widget
                title={s === 'review' ? 'Needs you' : s[0].toUpperCase() + s.slice(1)}
                accent={accentAt(i)}
                flush
                action={<span className="badge">{rows.length}</span>}
              >
                {rows.length === 0 ? <Empty>Empty.</Empty> : (
                  <Rows>
                    {rows.map((c) => (
                      <Row key={c.id} title={c.title} sub={`${c.channel}${c.scheduledFor ? ` · ${shortDate(c.scheduledFor)}` : ''}`} />
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

function channelsView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const channels = [...new Set(b.content.map((c) => c.channel))];

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what="Reach numbers are not connected yet"
        how="Kit is already wired and can supply subscriber and broadcast stats. LinkedIn has no API for personal reach, so that one stays a link and a manual number."
      />
      <section className="grid">
        {channels.map((ch, i) => {
          const rows = b.content.filter((c) => c.channel === ch);
          return (
            <div className="col-4" key={ch}>
              <Widget title={ch} accent={accentAt(i)} flush action={<span className="badge">{rows.length}</span>}>
                <Rows>
                  {rows.map((c) => (
                    <Row key={c.id} title={c.title} sub={c.state} aside={stateBadge(c.state)} />
                  ))}
                </Rows>
              </Widget>
            </div>
          );
        })}
      </section>
    </Zone>
  );
}

function campaignsView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const names = [...new Set(b.content.map((c) => c.campaign).filter((x): x is string => Boolean(x)))];
  const loose = b.content.filter((c) => !c.campaign);

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <section className="grid">
        {names.map((name, i) => {
          const rows = b.content.filter((c) => c.campaign === name);
          const done = rows.filter((c) => c.state === 'published').length;
          return (
            <div className="col-6" key={name}>
              <Widget
                title={name}
                accent={accentAt(i)}
                flush
                action={<span className="badge">{done}/{rows.length}</span>}
              >
                <Rows>
                  {rows.map((c) => (
                    <Row key={c.id} title={c.title} sub={c.channel} aside={stateBadge(c.state)} />
                  ))}
                </Rows>
              </Widget>
            </div>
          );
        })}
        {loose.length > 0 ? (
          <div className="col-6">
            <Widget title="No campaign" accent={accentAt(names.length)} flush action={<span className="badge">{loose.length}</span>}>
              <Rows>
                {loose.map((c) => <Row key={c.id} title={c.title} sub={c.channel} aside={stateBadge(c.state)} />)}
              </Rows>
            </Widget>
          </div>
        ) : null}
      </section>
    </Zone>
  );
}

function voiceView(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const principles = b.voiceRules.filter((r) => r.kind === 'principle');
  const avoid = b.voiceRules.filter((r) => r.kind === 'avoid');

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <div className="notice">
        <span className="icon-chip icon-chip--sm accent-violet">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
            <path d="M12 4.5v15" /><path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 2.5" /><path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 2.5" />
          </svg>
        </span>
        <div>
          <p className="row__title" style={{ fontSize: 14 }}>These are the same rules the Brain holds</p>
          <p className="muted" style={{ marginTop: 2 }}>
            Shown here because this is where drafts get written. Edit them in{' '}
            <a className="link" href="/d/brain/voice">The Brain → Voice</a>.
          </p>
        </div>
      </div>

      <section className="grid">
        <div className="col-6">
          <Widget title="Every draft must" accent="violet" flush>
            <Rows>
              {principles.map((r, i) => <Row key={r.id} accent={accentAt(i)} title={r.title} sub={r.detail} />)}
            </Rows>
          </Widget>
        </div>
        <div className="col-6">
          <Widget title="Every draft must never" accent="red" flush>
            <Rows>
              {avoid.map((r, i) => <Row key={r.id} accent={accentAt(i)} title={r.title} sub={r.detail} />)}
            </Rows>
          </Widget>
        </div>
      </section>
    </Zone>
  );
}
