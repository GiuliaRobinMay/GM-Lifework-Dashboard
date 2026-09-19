'use client';

import { usePathname } from 'next/navigation';
import { SearchIcon } from '@/components/Icon';
import { DOMAIN_BY_SLUG } from '@/lib/nav';

/**
 * The top bar carries three things and nothing else: where you are, the way
 * to jump anywhere, and the handful of links you open all day.
 */
export function Topbar({ pins }: { pins: { id: string; name: string; url: string }[] }) {
  const pathname = usePathname();

  let title = 'Command Center';
  if (pathname.startsWith('/d/')) {
    const slug = pathname.split('/')[2];
    const d = DOMAIN_BY_SLUG.get(slug);
    if (d) title = d.label;
  } else if (pathname.startsWith('/launchpad')) {
    title = 'Launchpad';
  } else if (pathname.startsWith('/settings')) {
    title = 'Settings';
  }

  return (
    <header className="topbar">
      <div className="topbar__crumbs">
        <span className="topbar__title">{title}</span>
      </div>

      <div className="topbar__spacer" />

      <div className="pinrail" aria-label="Pinned apps">
        {pins.map((p, i) => (
          <a
            key={p.id}
            className={`pin accent-${(['violet', 'red', 'green', 'orange'] as const)[i % 4]}`}
            href={p.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className="dot" />
            {p.name}
          </a>
        ))}
      </div>

      <button type="button" className="searchbtn" data-open-palette>
        <SearchIcon />
        Jump to anything
        <span className="kbd">⌘K</span>
      </button>
    </header>
  );
}
