import type { ReactNode } from 'react';
import type { Domain, Tab } from '@/lib/nav';
import type { Bundle } from '@/lib/data/bundle';
import { accentAt } from '@/lib/nav';
import { Widget, Row, Rows, Empty, Badge, PageHead, Launcher, SourceNote } from '@/components/ui';
import { tasksForDomain, appsForDomain, relativeDay, today } from '@/lib/data';

/**
 * The frame every zone shares.
 *
 * Lives apart from the registry so a zone can import it without the registry
 * importing the zone back.
 */

export function Zone({
  domain, tab, b, actions, children,
}: {
  domain: Domain;
  tab: Tab;
  b: Bundle;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="content content--wide stack">
      <PageHead title={domain.label} blurb={tab.blurb} actions={actions} />
      <SourceNote source={b.source} error={b.error} />
      {children}
    </main>
  );
}

/** Open work for this domain. */
export function WorkWidget({
  domain, b, title = 'Open work',
}: {
  domain: Domain;
  b: Bundle;
  title?: string;
}) {
  const rows = tasksForDomain(b.tasks, domain.slug);
  const now = today();
  return (
    <Widget title={title} accent={domain.accent} flush action={<span className="badge">{rows.length}</span>}>
      {rows.length === 0 ? (
        <Empty>Nothing open here.</Empty>
      ) : (
        <Rows>
          {rows.map((t, i) => {
            const rel = relativeDay(t.dueDate ?? t.doDate, now);
            return (
              <Row
                key={t.id}
                accent={accentAt(i)}
                title={t.title}
                sub={[t.clientName ?? t.area, t.status.replace('_', ' ')].filter(Boolean).join(' · ')}
                aside={
                  <>
                    {t.priority === 'urgent' || t.priority === 'high'
                      ? <Badge tone="red">{t.priority === 'urgent' ? 'Urgent' : 'High'}</Badge>
                      : null}
                    {rel ? <span className="badge">{rel}</span> : null}
                  </>
                }
              />
            );
          })}
        </Rows>
      )}
    </Widget>
  );
}

/** The external apps belonging to this domain. */
export function AppsWidget({ domain, b, title = 'Open in' }: { domain: Domain; b: Bundle; title?: string }) {
  const rows = appsForDomain(b.apps, domain.slug);
  if (rows.length === 0) return null;
  return (
    <Widget title={title} accent={domain.accent}>
      <Launcher apps={rows} />
    </Widget>
  );
}

/** Said once, plainly, where a live source is not connected yet. */
export function NotWired({ what, how }: { what: string; how: string }) {
  return (
    <div className="notice">
      <span className="icon-chip icon-chip--sm accent-violet">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" /><path d="M12 16v-5M12 8h.01" />
        </svg>
      </span>
      <div>
        <p className="row__title" style={{ fontSize: 14 }}>{what}</p>
        <p className="muted" style={{ marginTop: 2 }}>{how}</p>
      </div>
    </div>
  );
}
