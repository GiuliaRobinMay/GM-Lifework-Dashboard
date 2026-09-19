import { notFound } from 'next/navigation';
import { Tabs } from '@/components/Tabs';
import { DOMAIN_BY_SLUG, DOMAINS, findTab } from '@/lib/nav';
import { renderZone, zoneCounts } from '@/components/views';
import { loadAll } from '@/lib/data/bundle';

export async function generateStaticParams() {
  return DOMAINS.flatMap((d) => d.tabs.map((t) => ({ domain: d.slug, tab: [t.slug] })));
}

export async function generateMetadata({ params }: { params: Promise<{ domain: string; tab?: string[] }> }) {
  const { domain: slug, tab } = await params;
  const domain = DOMAIN_BY_SLUG.get(slug);
  if (!domain) return { title: 'Not found — Lifework' };
  const t = findTab(domain, tab?.[0]);
  return { title: `${domain.label} · ${t.label} — Lifework` };
}

/**
 * One route serves every domain and every tab.
 *
 * The left rail picks the domain, the tab strip picks the zone, and the view
 * registry in src/components/views decides what to draw. Adding a zone is a
 * config entry plus a case — never a new route.
 */
export default async function DomainPage({
  params,
}: {
  params: Promise<{ domain: string; tab?: string[] }>;
}) {
  const { domain: slug, tab } = await params;
  const domain = DOMAIN_BY_SLUG.get(slug);
  if (!domain) notFound();

  // An unknown tab falls back to the first one rather than 404ing — a stale
  // bookmark should land you somewhere useful, not on an error.
  const active = findTab(domain, tab?.[0]);
  const bundle = await loadAll();

  return (
    <>
      <Tabs domain={domain} active={active.slug} counts={zoneCounts(domain, bundle)} />
      {renderZone(domain, active, bundle)}
    </>
  );
}
