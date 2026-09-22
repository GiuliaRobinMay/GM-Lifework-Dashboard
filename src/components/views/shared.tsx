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
  domain, tab, b, actions, children, head = true,
}: {
  domain: Domain;
  tab: Tab;
  b: Bundle;
  actions?: ReactNode;
  children: ReactNode;
  /** The band above already names the zone; a page heading repeats it. */
  head?: boolean;
}) {
  return (
    <main className="content content--wide stack">
      {head ? <PageHead title={domain.label} blurb={tab.blurb} actions={actions} /> : null}
      <SourceNote source={b.source} error={b.error} missingEnv={b.missingEnv} />
      {children}
    </main>
  );
}

/**
 * A portal view: the table on the left, a side banner on the right.
 *
 * Two thirds for the work, one third for whatever belongs beside it. The
 * left column is pinned to the page edge and clips rather than pushing the
 * banner out of the way — a table that grows a column should scroll, not
 * steal the space next to it. The banner sticks as the table scrolls.
 */
export function Portal({
  note, children, side,
}: {
  /** Drawn full width above both columns — it is about the page, not the table. */
  note?: ReactNode;
  children: ReactNode;
  side: ReactNode;
}) {
  return (
    <main className="portal">
      {note}
      <div className="portal__split">
        <div className="portal__main">{children}</div>
        <aside className="portal__side">{side}</aside>
      </div>
    </main>
  );
}

/**
 * The side banner before she has said what goes in it.
 *
 * It says so rather than showing a plausible-looking widget. An empty panel
 * dressed as a finished one is the thing she has asked me twice not to do.
 */
export function SideReserved({ zone }: { zone: string }) {
  return (
    <section className="card sidepanel">
      <p className="sidepanel__title">Side banner</p>
      <p className="sidepanel__body">
        This third of the page is kept for {zone}. Tell me what belongs here
        and I will build it. Until then it stays empty on purpose.
      </p>
    </section>
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
