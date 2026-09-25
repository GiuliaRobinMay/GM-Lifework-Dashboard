'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * The panel on the right.
 *
 * Fixed to the right edge and drawn over the table, the way Notion peeks a
 * page: the list stays where it was, the record opens beside it. The panel
 * is a URL state (?peek=id), so back closes it and the address can be
 * shared. Escape and the × both close it; the arrow opens the full page.
 */
export function Peek({
  title, closeHref, fullHref, children,
}: {
  title: string;
  closeHref: string;
  fullHref: string;
  children: ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') router.push(closeHref, { scroll: false }); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeHref, router]);

  return (
    <aside className="peek" role="dialog" aria-label={title}>
      <div className="peek__bar">
        <Link href={closeHref} scroll={false} className="peek__btn" aria-label="Close" title="Close (Esc)">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </Link>
        <span className="peek__title">{title}</span>
        <Link href={fullHref} className="peek__btn" aria-label="Open full page" title="Open full page">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 3H3.5A1.5 1.5 0 0 0 2 4.5v8A1.5 1.5 0 0 0 3.5 14h8a1.5 1.5 0 0 0 1.5-1.5V10M9.5 2H14v4.5M14 2 7.5 8.5" />
          </svg>
        </Link>
      </div>
      <div className="peek__body">{children}</div>
    </aside>
  );
}
