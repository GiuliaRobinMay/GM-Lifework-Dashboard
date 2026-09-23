'use client';

import Link from 'next/link';
import type { Domain } from '@/lib/nav';

/**
 * The tab strip.
 *
 * Airtable's table tabs: the strip is tinted with the base's colour and runs
 * the full width; the active tab is white, square-shouldered at the bottom
 * and flush to it, so it reads as continuous with the toolbar below.
 *
 * A tab marked `startsGroup` is preceded by a vertical rule: what follows is
 * a different kind of thing, not just the next item along.
 */
export function Tabs({ domain, active }: { domain: Domain; active: string }) {
  return (
    <nav className="tabs" aria-label={`${domain.label} sections`}>
      {domain.tabs.map((t) => {
        const isActive = t.slug === active;
        return (
          <span key={t.slug} className="tabs__slot">
            {t.startsGroup ? <span className="tabs__divider" aria-hidden="true" /> : null}
            <Link
              href={`/d/${domain.slug}/${t.slug}`}
              className={`tabs__item${isActive ? ' tabs__item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {t.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}
