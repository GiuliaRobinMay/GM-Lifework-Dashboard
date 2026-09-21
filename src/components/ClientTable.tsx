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
 * DONE and ARCHIVE start folded. Every cell is ruled.
 *
 * Writes from here: the status select moves a row; the two icons at the end
 * archive it or delete it (delete asks first).
 */
export function ClientTable({
  companies, contacts, q = '',
}: {
  companies: Company[];
  contacts: Contact[];
  q?: string;
}) {
  const [open, setOpen] = useState<Record<ClientStatus, boolean>>({ ...STATUS_OPEN_BY_DEFAULT });

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
    <table className="ctable">
      <thead>
        <tr>
          <th>Community</th>
          <th>Client</th>
          <th>Status</th>
          <th>Mighty Networks</th>
          <th>Upwork</th>
          <th aria-label="Actions" />
        </tr>
      </thead>
      {groups.filter((g) => !needle || g.rows.length > 0).map(({ status, rows }) => (
        <tbody key={status} className={`ctable__group ctable__group--${status}`}>
          <tr className="ctable__head">
            <td colSpan={6}>
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
            <tr><td colSpan={6} className="ctable__empty">{needle ? 'No match.' : 'Nothing here.'}</td></tr>
          ) : null}
        </tbody>
      ))}
    </table>
  );
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
      <td className="ctable__actions">
        {c.status !== 'archived' ? (
          <button
            type="button"
            className="iconbtn"
            title="Archive"
            aria-label={`Archive ${c.name}`}
            disabled={pending}
            onClick={() => run(() => archiveClient(c.id))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
            </svg>
          </button>
        ) : null}
        <button
          type="button"
          className="iconbtn iconbtn--danger"
          title="Delete"
          aria-label={`Delete ${c.name}`}
          disabled={pending}
          onClick={() => setConfirming(true)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
        {confirming ? (
          <ConfirmDialog
            title={`Delete ${c.name}?`}
            body={`This removes the client${others >= 0 && who ? `, ${others + 1 === 1 ? 'their contact' : `their ${others + 1} contacts`}` : ''} and any apps recorded for them. It cannot be undone. Archiving keeps everything.`}
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
