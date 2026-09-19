import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="content stack">
      <div className="card accent-violet" style={{ padding: 32, textAlign: 'center' }}>
        <p className="eyebrow">404</p>
        <h1 className="page-title" style={{ marginTop: 8 }}>That page is not part of the dashboard</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Try the command palette — it reaches every domain, tab, client and app.
        </p>
        <div className="hstack" style={{ justifyContent: 'center', marginTop: 20 }}>
          <Link className="btn btn--primary" href="/">Command Center</Link>
          <button type="button" className="btn btn--ghost" data-open-palette>Jump to anything</button>
        </div>
      </div>
    </main>
  );
}
