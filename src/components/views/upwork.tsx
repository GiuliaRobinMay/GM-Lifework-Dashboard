import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { Widget, Empty } from '@/components/ui';
import { Zone, AppsWidget, WorkWidget, NotWired } from '@/components/views/shared';

/**
 * Upwork.
 *
 * The Upwork MCP server is connected and can read invitations, proposals,
 * contracts, offers and financials. It is deliberately NOT called at render
 * time: a dashboard that hits a third-party API on every page load is a
 * dashboard that is slow and rate-limited by lunchtime.
 *
 * The shape here is the target. The build is a scheduled sync that writes
 * these rows into Supabase, which this zone then reads like everything else.
 */
export function upworkZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const titles: Record<string, string> = {
    inbox: 'Invitations and messages',
    proposals: 'Sent proposals',
    contracts: 'Running contracts',
    offers: 'Offers on the table',
    financials: 'Earnings and connects',
  };

  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what="Upwork is connected, but not synced yet"
        how="The server can already read this data. The missing piece is a scheduled job that writes it into Supabase — polling Upwork on every page load would be slow and rate-limited. See docs/ROADMAP.md."
      />
      <section className="grid">
        <div className="col-7">
          <Widget title={titles[tab.slug] ?? tab.label} accent={domain.accent} flush>
            <Empty>Nothing synced yet.</Empty>
          </Widget>
        </div>
        <div className="col-5">
          <div className="stack-sm">
            <WorkWidget domain={domain} b={b} />
            <AppsWidget domain={domain} b={b} />
          </div>
        </div>
      </section>
    </Zone>
  );
}
