'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { Company, Contact, ClientStatus } from '@/lib/crm';
import {
  STATUS_LABEL, STATUS_ORDER, STATUS_OPEN_BY_DEFAULT,
  fullName, primaryContact, contactsFor,
} from '@/lib/crm';
import { setStatus, archiveClient, deleteClient } from '@/app/d/clients/actions';

/**
 * The client table.
 *
 * Grouped by status in Notion's order, each group a fold with its count.
 * DONE and ARCHIVE start folded. Every cell is ruled with a single hairline.
 *
 * Columns can be dragged wider or narrower at the header edge; the widths
 * are kept in this browser so the table opens the way it was left.
 *
 * Writes from here: the status select moves a row; archive and delete are
 * the last two columns (delete asks first).
 */

const COLS = ['Community', 'Client', 'Status', 'Mighty Networks', 'Upwork', '', ''] as const;
const DEFAULT_WIDTHS = [260, 210, 170, 175, 130, 60, 60];
const MIN_WIDTH = 56;
const STORE = 'lifework.clients.cols';

export function ClientTable({
  companies, contacts, q = '',
}: {
  companies: Company[];
  contacts: Contact[];
  q?: string;
}) {
  const [open, setOpen] = useState<Record<ClientStatus, boolean>>({ ...STATUS_OPEN_BY_DEFAULT });
  const [widths, setWidths] = useState<number[]>(DEFAULT_WIDTHS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? 'null');
      if (Array.isArray(saved) && saved.length === COLS.length) setWidths(saved);
    } catch { /* a bad value falls back to the defaults */ }
  }, []);

  function resize(i: number, w: number) {
    setWidths((prev) => {
      const next = [...prev];
      next[i] = Math.max(MIN_WIDTH, Math.round(w));
      try { localStorage.setItem(STORE, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }

  const needle = q.trim().toLowerCase();
  const matches = (c: Company) => {
    if (!needle) return true;
    if (c.name.toLowerCase().includes(needle)) return true;
    return contactsFor(contacts, c.id).some((p) => fullName(p).toLowerCase().includes(needle));
  };

  const groups = STATUS_ORDER.map((status) => ({
    status,
    rows: companies
      .filter((c) => c.status === status && matches(c))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  // A search opens every group and hides the empty ones, so a hit in ARCHIVE
  // is not behind a fold and misses do not pad the page.
  const isOpen = (s: ClientStatus) => (needle ? true : open[s]);

  return (
    <table className="ctable" style={{ width: widths.reduce((a, b) => a + b, 0) }}>
      <colgroup>
        {widths.map((w, i) => <col key={i} style={{ width: w }} />)}
      </colgroup>
      <thead>
        <tr>
          {COLS.map((label, i) => (
            <th key={i} aria-label={label || (i === 5 ? 'Archive' : 'Delete')}>
              {label}
              <ResizeHandle onResize={(dx) => resize(i, widths[i] + dx)} />
            </th>
          ))}
        </tr>
      </thead>
      {groups.filter((g) => !needle || g.rows.length > 0).map(({ status, rows }) => (
        <tbody key={status} className={`ctable__group ctable__group--${status}`}>
          <tr className="ctable__head">
            <td colSpan={COLS.length}>
              <button
                type="button"
                className="ctable__fold"
                aria-expanded={isOpen(status)}
                onClick={() => setOpen((o) => ({ ...o, [status]: !o[status] }))}
              >
                <span className="ctable__caret" aria-hidden="true">{isOpen(status) ? '▾' : '▸'}</span>
                <span className={`status status--${status}`}>{STATUS_LABEL[status]}</span>
                <span className="ctable__count">{rows.length}</span>
              </button>
            </td>
          </tr>
          {isOpen(status) ? rows.map((c) => (
            <ClientRow key={c.id} company={c} contacts={contacts} />
          )) : null}
          {isOpen(status) && rows.length === 0 ? (
            <tr><td colSpan={COLS.length} className="ctable__empty">{needle ? 'No match.' : 'Nothing here.'}</td></tr>
          ) : null}
        </tbody>
      ))}
    </table>
  );
}

/** The drag edge on a header cell. Horizontal movement only. */
function ResizeHandle({ onResize }: { onResize: (dx: number) => void }) {
  const last = useRef(0);
  function down(e: React.MouseEvent) {
    e.preventDefault();
    last.current = e.clientX;
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - last.current;
      last.current = ev.clientX;
      onResize(dx);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }
  return <span className="ctable__grip" onMouseDown={down} aria-hidden="true" />;
}

function ClientRow({ company: c, contacts }: { company: Company; contacts: Contact[] }) {
  const who = primaryContact(contacts, c.id);
  const others = contactsFor(contacts, c.id).length - 1;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function run(fn: () => Promise<{ error: string | null }>) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r.error) setError(r.error);
    });
  }

  return (
    <tr className={pending ? 'ctable__row ctable__row--pending' : 'ctable__row'}>
      <td>
        <Link href={`/d/clients/all/${c.id}`} className="ctable__name">{c.name}</Link>
      </td>
      <td>
        {who ? fullName(who) : <span className="muted">—</span>}
        {others > 0 ? <span className="ctable__more">+{others}</span> : null}
      </td>
      <td>
        <select
          className={`status status--${c.status} status--select`}
          value={c.status}
          disabled={pending}
          onChange={(e) => run(() => setStatus(c.id, e.target.value as ClientStatus))}
          aria-label={`Status of ${c.name}`}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        {error ? <span className="ctable__error" role="alert">{error}</span> : null}
      </td>
      <td>
        {c.communityUrl
          ? <a className="ctable__link" href={c.communityUrl} target="_blank" rel="noreferrer">Open ↗</a>
          : <span className="muted">—</span>}
      </td>
      <td>
        {c.upworkUrl
          ? <a className="ctable__link" href={c.upworkUrl} target="_blank" rel="noreferrer">Open ↗</a>
          : <span className="muted">—</span>}
      </td>
      <td className="ctable__action">
        {c.status !== 'archived' ? (
          <button
            type="button"
            className="iconbtn iconbtn--archive"
            title="Archive"
            aria-label={`Archive ${c.name}`}
            disabled={pending}
            onClick={() => run(() => archiveClient(c.id))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
            </svg>
          </button>
        ) : null}
      </td>
      <td className="ctable__action">
        <button
          type="button"
          className="iconbtn iconbtn--delete"
          title="Delete"
          aria-label={`Delete ${c.name}`}
          disabled={pending}
          onClick={() => setConfirming(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
        {confirming ? (
          <ConfirmDialog
            title={`Delete ${c.name}?`}
            body={`This removes the client${who ? (others > 0 ? `, their ${others + 1} contacts` : ', their contact') : ''} and any apps recorded for them. It cannot be undone. Archiving keeps everything.`}
            confirmLabel="Delete"
            onCancel={() => setConfirming(false)}
            onConfirm={() => { setConfirming(false); run(() => deleteClient(c.id)); }}
          />
        ) : null}
      </td>
    </tr>
  );
}

/** A native <dialog>, opened modally, closed by Escape, backdrop or a button. */
export function ConfirmDialog({
  title, body, confirmLabel, onCancel, onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const onClose = () => onCancel();
    d.addEventListener('close', onClose);
    return () => d.removeEventListener('close', onClose);
  }, [onCancel]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
    >
      <div className="dialog__body">
        <p className="dialog__title">{title}</p>
        <p className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>{body}</p>
        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </dialog>
  );
}
