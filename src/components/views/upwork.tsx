import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { clientsOnly } from '@/lib/upwork';
import { Empty, SourceNote } from '@/components/ui';
import { MessagesTable, UpworkClientsTable } from '@/components/UpworkTables';

/**
 * Upwork.
 *
 * Read from the freelancer account and imported into Supabase; this zone
 * never calls Upwork at render time. A dashboard that hits a third-party API
 * on every page load is a dashboard that is rate-limited by lunchtime.
 *
 * Three tabs. Messages is every conversation. Clients is the ones that came
 * to a contract, with what they paid — contracts and money are columns on the
 * client, not places of their own. Proposals is the third.
 */
export function upworkZone(domain: Domain, tab: Tab, b: Bundle): ReactNode {
  return (
    <main className="content content--wide stack">
      <SourceNote source={b.source} error={b.error} missingEnv={b.missingEnv} />
      {body(tab, b)}
    </main>
  );
}

function body(tab: Tab, b: Bundle): ReactNode {
  if (b.upworkLeads.length === 0) {
    return <Empty>Nothing imported from Upwork yet.</Empty>;
  }

  switch (tab.slug) {
    case 'clients': {
      const clients = clientsOnly(b.upworkLeads);
      if (clients.length === 0) return <Empty>No conversation has become a contract yet.</Empty>;
      return <UpworkClientsTable leads={b.upworkLeads} invoices={b.upworkInvoices} />;
    }

    case 'proposals':
      return proposalsNotYet();

    case 'messages':
    default:
      return <MessagesTable leads={b.upworkLeads} />;
  }
}

/**
 * Proposals are not imported.
 *
 * The rooms and the money came across; the proposals did not, and an empty
 * table styled like a full one reads as "you have sent none". This says what
 * is actually true and what it would take to change it.
 */
function proposalsNotYet(): ReactNode {
  return (
    <section className="card" style={{ padding: 24 }}>
      <p className="section-title">Proposals are not imported yet</p>
      <p className="muted" style={{ marginTop: 8, lineHeight: 1.65, maxWidth: 640 }}>
        The conversations and the money are in. The proposals are a separate
        read from Upwork and have not been run, so this table would be empty
        rather than short. The columns are already in the database waiting for
        them: what was sent, the rate offered, and the job it answered.
      </p>
    </section>
  );
}
