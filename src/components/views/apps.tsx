import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { accentAt } from '@/lib/nav';
import { Widget, Row, Rows, Empty } from '@/components/ui';
import { Zone, AppsWidget, WorkWidget } from '@/components/views/shared';

/**
 * Apps & Deployments.
 *
 * Everything she has shipped runs for a client, and a deployment's name, host
 * and URL each name that client. So this domain holds no deployment records.
 * What it holds is her own consoles and the state of her own building — and a
 * clear pointer to where client infrastructure is actually looked at.
 *
 * This was the hardest cut to make and the most obviously right one: an
 * incident row naming a client's live site is exactly the thing that must not
 * sit on a general dashboard.
 */
export function appsZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <div className="notice">
        <span className="icon-chip icon-chip--sm accent-orange">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" /><path d="M12 8v5M12 16h.01" />
          </svg>
        </span>
        <div>
          <p className="row__title" style={{ fontSize: 14 }}>Client deployments are not listed here</p>
          <p className="muted" style={{ marginTop: 2 }}>
            A deployment&rsquo;s name, host and URL each identify the client it runs for, so none of
            them are kept in this dashboard. Client infrastructure is looked at in{' '}
            <a className="link" href="/d/clients/communities">Clients → Communities</a>, or in the
            cloud console directly.
          </p>
        </div>
      </div>

      <section className="grid">
        <div className="col-7">
          {tab.slug === 'live' || tab.slug === 'incidents' ? (
            <Widget
              title={tab.slug === 'incidents' ? 'Your own incidents' : 'Your own deployments'}
              accent={domain.accent}
              flush
            >
              <Empty>
                Nothing of your own is deployed yet — this dashboard will be the first.
              </Empty>
            </Widget>
          ) : (
            <WorkWidget domain={domain} b={b} title={tab.slug === 'workers' ? 'Waiting on you' : 'In flight'} />
          )}
        </div>

        <div className="col-5">
          <div className="stack-sm">
            <AppsWidget domain={domain} b={b} title="Consoles" />
            <Widget title="This dashboard" accent="green" flush>
              <Rows>
                <Row accent={accentAt(0)} icon="rocket" title="Lifework" sub="Not deployed yet — runs locally" />
                <Row
                  accent={accentAt(1)}
                  icon="grid"
                  title="Supabase project"
                  sub="Holds your own work only — no client tables"
                  href="https://supabase.com/dashboard"
                  external
                />
              </Rows>
            </Widget>
          </div>
        </div>
      </section>
    </Zone>
  );
}
