'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { DOMAINS, GROUP_ORDER, domainHref, type DomainGroup } from '@/lib/nav';

/**
 * The left rail: where you are.
 *
 * Stable order, five groups, never reordered by activity. You learn it once
 * and then your hand knows it. Counts ride on the right where they exist;
 * a dot means "this wants you" without claiming a number it cannot back up.
 */
export function Sidebar({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark">GM</span>
        <div>
          <div className="sidebar__wordmark">Lifework</div>
          <div className="muted" style={{ fontSize: 11.5 }}>Giulia May</div>
        </div>
      </div>

      <nav className="sidebar__scroll" aria-label="Primary">
        <div className="sidebar__group">
          <Link
            href="/"
            className={`sidebar__item${pathname === '/' ? ' sidebar__item--active' : ''}`}
          >
            <span className="icon-chip icon-chip--sm accent-violet"><Icon name="home" /></span>
            Command Center
          </Link>
        </div>

        {GROUP_ORDER.map((group: DomainGroup) => (
          <div className="sidebar__group" key={group}>
            <p className="eyebrow">{group}</p>
            {DOMAINS.filter((d) => d.group === group).map((d) => {
              const active = pathname.startsWith(`/d/${d.slug}`);
              const count = counts[d.slug] ?? 0;
              return (
                <Link
                  key={d.slug}
                  href={domainHref(d)}
                  className={`sidebar__item${active ? ' sidebar__item--active' : ''}`}
                >
                  <span className={`icon-chip icon-chip--sm accent-${d.accent}`}><Icon name={d.icon} /></span>
                  {d.label}
                  {count > 0 ? <span className="sidebar__count">{count}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">
        <Link
          href="/launchpad"
          className={`sidebar__item${pathname.startsWith('/launchpad') ? ' sidebar__item--active' : ''}`}
        >
          <span className="icon-chip icon-chip--sm accent-orange"><Icon name="grid" /></span>
          Launchpad
        </Link>
        <Link
          href="/settings"
          className={`sidebar__item${pathname.startsWith('/settings') ? ' sidebar__item--active' : ''}`}
        >
          <span className="icon-chip icon-chip--sm accent-green"><Icon name="settings" /></span>
          Settings
        </Link>
      </div>
    </aside>
  );
}
