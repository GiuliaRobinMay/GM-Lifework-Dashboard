import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { appsForDomain } from '@/lib/data';
import { byStatus, appsFor } from '@/lib/crm';
import { Zone, WorkWidget, AppsWidget, NotWired } from '@/components/views/shared';

import { clientsZone } from '@/components/views/clients';
import { brainZone } from '@/components/views/brain';
import { contentZone } from '@/components/views/content';
import { appsZone } from '@/components/views/apps';
import { lifeZone } from '@/components/views/life';
import { ventureZone } from '@/components/views/ventures';
import { upworkZone } from '@/components/views/upwork';

/**
 * The view registry.
 *
 * One function per domain family. Each takes the domain, the active tab and
 * the shared bundle, and returns the body under the tab strip. Adding a zone
 * is a config entry plus a case — never a new route.
 */
export function renderZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  switch (domain.slug) {
    case 'clients': return clientsZone(domain, tab, b);
    case 'brain': return brainZone(domain, tab, b);
    case 'content': return contentZone(domain, tab, b);
    case 'apps': return appsZone(domain, tab, b);
    case 'upwork': return upworkZone(domain, tab, b);
    case 'studying':
    case 'fitness':
    case 'accountancy': return lifeZone(domain, tab, b);
    case 'big-tribe-builders':
    case 'quinb-academy':
    case 'giulia-may': return ventureZone(domain, tab, b);
    default: return genericZone(domain, tab, b);
  }
}

/** Counts on the tab strip. Only where the number is honest. */
export function zoneCounts(domain: Domain, b: Bundle): Record<string, number> {
  switch (domain.slug) {
    // Client counts only appear once the live Notion read has returned; an
    // unconnected zone shows no numbers rather than zeros, which would read
    // as "you have no clients".
    // Counts only once the CRM is connected; zeros would read as "you have no
    // clients", which is a different and wrong statement.
    case 'clients':
      // One tab, and the strip is not drawn for it. The status counts live on
      // the page itself, where they can be read against the list.
      return {};
    case 'content':
      return {
        today: b.content.filter((c) => c.state === 'review' || c.state === 'scheduled').length,
        pipeline: b.content.filter((c) => c.state !== 'published').length,
      };
    case 'brain':
      return { sources: b.brainSources.filter((s) => s.state === 'connected').length };
    case 'studying':
      return { courses: b.courses.filter((c) => c.state !== 'done').length };
    default:
      return {};
  }
}

function genericZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  const apps = appsForDomain(b.apps, domain.slug);
  return (
    <Zone domain={domain} tab={tab} b={b}>
      <NotWired
        what={`${domain.label} — ${tab.label} is not wired to a live source yet`}
        how="Its open work and links are real. The rest arrives when this domain's source is connected — see Settings."
      />
      <section className="grid">
        <div className="col-7"><WorkWidget domain={domain} b={b} /></div>
        {apps.length > 0 ? <div className="col-5"><AppsWidget domain={domain} b={b} /></div> : null}
      </section>
    </Zone>
  );
}
