import { AppSquares, OVERVIEW_APPS } from '@/components/AppLogo';

/**
 * The Command Center.
 *
 * Giulia's brief (23 Sep 2026): no greeting, no date, no search, no pins, no
 * "jump to anything", no Launchpad button, no task and goal widgets. The first
 * thing on the page is an overview: square buttons to the main applications,
 * with their real logos.
 */
export default function CommandCenter() {
  return (
    <main className="content content--wide stack">
      <section>
        <p className="eyebrow" style={{ marginBottom: 14 }}>Overview</p>
        <AppSquares apps={OVERVIEW_APPS} />
      </section>
    </main>
  );
}
