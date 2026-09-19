import { notFound } from 'next/navigation';
import { Tabs } from '@/components/Tabs';
import { DOMAIN_BY_SLUG, findTab } from '@/lib/nav';
import { companyDetail } from '@/components/views/clients';
import { zoneCounts } from '@/components/views';
import { loadAll } from '@/lib/data/bundle';

/**
 * One client.
 *
 * Sits under the tab it was opened from, so the tab strip keeps its place and
 * "back" means the list you came from rather than a generic index. This route
 * is more specific than /d/[domain]/[[...tab]], so Next matches it first.
 */
export async function generateMetadata({ params }: { params: Promise<{ company: string }> }) {
  const { company } = await params;
  const b = await loadAll();
  const row = b.companies.find((c) => c.id === company);
  return { title: row ? `${row.name} — Lifework` : 'Client — Lifework' };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ tab: string; company: string }>;
}) {
  const { tab, company } = await params;
  const domain = DOMAIN_BY_SLUG.get('clients');
  if (!domain) notFound();

  const b = await loadAll();
  const row = b.companies.find((c) => c.id === company);
  if (!row) notFound();

  return (
    <>
      <Tabs domain={domain} active={findTab(domain, tab).slug} counts={zoneCounts(domain, b)} />
      {companyDetail(row, b)}
    </>
  );
}
