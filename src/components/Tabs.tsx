'use client';

import Link from 'next/link';
import type { Domain } from '@/lib/nav';

/**
 * The tab strip: what you are looking at.
 *
 * Drawn by the top bar, on the same line as the domain's icon and name, so
 * the band at the top is one thing. Never more than five tabs. Moving between
 * zones of one domain is a single click and never changes the left rail.
 */
export function Tabs({
  domain, active,
}: {
  domain: Domain;
  active: string;
}) {
  return (
    <nav className={`tabs accent-${domain.accent}`} aria-label={`${domain.label} sections`}>
      {domain.tabs.map((t) => {
        const isActive = t.slug === active;
        return (
          <Link
            key={t.slug}
            href={`/d/${domain.slug}/${t.slug}`}
            className={`tabs__item${isActive ? ' tabs__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
