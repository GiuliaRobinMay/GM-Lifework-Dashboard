import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { SourceNote } from '@/components/ui';
import { Portal } from '@/components/views/shared';
import { ZoneGrid } from '@/components/views/grids';

import { clientsZone } from '@/components/views/clients';
import { upworkZone } from '@/components/views/upwork';

/**
 * The view registry.
 *
 * Every zone is the same grid under the same chrome. Clients and Upwork have
 * their own because they write back; everything else is columns over the
 * bundle, and a tab with no source yet still draws its columns.
 */
export function renderZone(domain: Domain, tab: Tab, b: Bundle, q = ''): ReactNode {
  switch (domain.slug) {
    case 'clients': return clientsZone(domain, tab, b, q);
    case 'upwork': return upworkZone(domain, tab, b, q);
    default: return gridZone(domain, tab, b);
  }
}

function gridZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <Portal note={<SourceNote source={b.source} error={b.error} missingEnv={b.missingEnv} />}>
      <ZoneGrid domain={domain.slug} tab={tab.slug} blurb={tab.blurb} b={b} />
    </Portal>
  );
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
