'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Icon, SearchIcon } from '@/components/Icon';
import { DOMAIN_BY_SLUG, findTab } from '@/lib/nav';
import { Tabs } from '@/components/Tabs';
import { ClientsBar } from '@/components/ClientsBar';

type Pin = { id: string; name: string; url: string };

/**
 * The top bar.
 *
 * Inside a domain it is a band in the domain's colour, two rows: the icon,
 * the name in the middle and search on the first; the tabs on the second.
 * Outside a domain it is the plain bar: where you are, and the palette.
 */
export function Topbar({ pins }: { pins: Pin[] }) {
  const pathname = usePathname();
  const parts = pathname.split('/');
  const domain = pathname.startsWith('/d/') ? DOMAIN_BY_SLUG.get(parts[2]) : undefined;

  if (domain) {
    const activeTab = findTab(domain, parts[3]).slug;
    const isClients = domain.slug === 'clients';
    return (
      <header className={`topbar topbar--band accent-${domain.accent}`}>
        <div className="band__top">
          <span className="topbar__icon"><Icon name={domain.icon} /></span>
          <span className="topbar__title">{domain.label}</span>
          <div className="band__right">
            {isClients
              ? <Suspense fallback={null}><ClientsBar part="search" /></Suspense>
              : null}
          </div>
        </div>
        <div className="band__tabs">
          <span className="band__list" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </span>
          <Tabs domain={domain} active={activeTab} />
          <div className="topbar__spacer" />
          {isClients
            ? <Suspense fallback={null}><ClientsBar part="add" /></Suspense>
            : <PinRail pins={pins} />}
        </div>
      </header>
    );
  }

  const title = pathname.startsWith('/launchpad') ? 'Launchpad'
    : pathname.startsWith('/settings') ? 'Settings'
    : 'Command Center';

  return (
    <header className="topbar">
      <div className="topbar__crumbs">
        <span className="topbar__title">{title}</span>
      </div>
      <div className="topbar__spacer" />
      <PinRail pins={pins} />
      <PaletteButton />
    </header>
  );
}

function PaletteButton() {
  return (
    <button type="button" className="searchbtn" data-open-palette aria-label="Search">
      <SearchIcon />
      Search
    </button>
  );
}

function PinRail({ pins }: { pins: Pin[] }) {
  return (
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
  );
}
