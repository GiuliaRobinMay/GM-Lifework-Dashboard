'use client';

import Link from 'next/link';
import type { Domain } from '@/lib/nav';

/**
 * The tab strip: what you are looking at.
 *
 * Horizontal, always visible, never more than five. Moving between zones of
 * one domain is a single click and never changes the left rail — which is the
 * whole point of splitting "where" from "what".
 */
export function Tabs({
  domain, active, counts,
}: {
  domain: Domain;
  active: string;
  counts?: Record<string, number>;
}) {
  return (
    <nav className="tabs" aria-label={`${domain.label} sections`}>
      {domain.tabs.map((t) => {
        const isActive = t.slug === active;
        const count = counts?.[t.slug];
        return (
          <Link
            key={t.slug}
            href={`/d/${domain.slug}/${t.slug}`}
            className={`tabs__item${isActive ? ' tabs__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {t.label}
            {count ? <span className="tabs__count">{count}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
