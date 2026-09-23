'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import type { Company, Contact, ClientStatus } from '@/lib/crm';
import {
  STATUS_LABEL, STATUS_ORDER, STATUS_OPEN_BY_DEFAULT,
  fullName, primaryContact, contactsFor,
} from '@/lib/crm';
import { setStatus, archiveClient, deleteClient } from '@/app/d/clients/actions';
import { Grid, type Column, type Group } from '@/components/Grid';

/**
 * The client table.
 *
 * The same grid as everywhere else in the app — same rules, same row height,
 * same field glyphs in the header — grouped by status in Notion's order, each
 * group a fold with its count. DONE and ARCHIVE start folded.
 *
 * Writes from here: the status select moves a row; archive and delete are
 * the last two columns (delete asks first).
 */

const STORE = 'lifework.clients.cols';

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

  const columns: Column<Company>[] = [
    {
      key: 'community', label: 'Community', type: 'text', width: 260,
      render: (c) => <Link href={`/d/clients/all/${c.id}`} className="grid2__name">{c.name}</Link>,
    },
    {
      key: 'client', label: 'Client', type: 'text', width: 210,
      render: (c) => <ClientCell company={c} contacts={contacts} />,
    },
    {
      key: 'status', label: 'Status', type: 'select', width: 170,
      render: (c) => <StatusCell company={c} />,
    },
    {
      key: 'mighty', label: 'Mighty Networks', type: 'link', width: 175,
      render: (c) => (c.communityUrl
        ? <a className="grid2__link" href={c.communityUrl} target="_blank" rel="noreferrer">Open ↗</a>
        : <span className="grid2__dash">—</span>),
    },
    {
      key: 'upwork', label: 'Upwork', type: 'link', width: 130,
      render: (c) => (c.upworkUrl
        ? <a className="grid2__link" href={c.upworkUrl} target="_blank" rel="noreferrer">Open ↗</a>
        : <span className="grid2__dash">—</span>),
    },
    {
      key: 'archive', label: 'Archive', type: 'text', width: 60, bare: true,
      render: (c) => <ArchiveCell company={c} />,
    },
    {
      key: 'delete', label: 'Delete', type: 'text', width: 60, bare: true,
      render: (c) => <DeleteCell company={c} contacts={contacts} />,
    },
  ];

  // A search opens every group and hides the empty ones, so a hit in ARCHIVE
  // is not behind a fold and misses do not pad the page.
  const groups: Group<Company>[] = STATUS_ORDER.map((status) => ({
    key: status,
    head: <span className={`status status--${status}`}>{STATUS_LABEL[status]}</span>,
    rows: companies
      .filter((c) => c.status === status && matches(c))
      .sort((a, b) => a.name.localeCompare(b.name)),
    open: needle ? true : open[status],
    onToggle: () => setOpen((o) => ({ ...o, [status]: !o[status] })),
    empty: needle ? 'No match.' : 'Nothing here.',
  })).filter((g) => !needle || g.rows.length > 0);

  return (
    <Grid
      columns={columns}
      {...(companies.length > 0 ? { groups } : {})}
      rowKey={(c) => c.id}
      store={STORE}
      empty="No clients in the database yet."
    />
  );
}

// ------------------------------------------------------------------ cells

function ClientCell({ company: c, contacts }: { company: Company; contacts: Contact[] }) {
  const who = primaryContact(contacts, c.id);
  const others = contactsFor(contacts, c.id).length - 1;
  return (
    <>
      {who ? fullName(who) : <span className="grid2__dash">—</span>}
      {others > 0 ? <span className="grid2__more">+{others}</span> : null}
    </>
  );
}

function StatusCell({ company: c }: { company: Company }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <>
      <select
        className={`status status--${c.status} status--select`}
        value={c.status}
        disabled={pending}
        onChange={(e) => {
          setError(null);
          const next = e.target.value as ClientStatus;
          start(async () => {
            const r = await setStatus(c.id, next);
            if (r.error) setError(r.error);
          });
        }}
        aria-label={`Status of ${c.name}`}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
        ))}
      </select>
      {error ? <span className="grid2__error" role="alert">{error}</span> : null}
    </>
  );
}

function ArchiveCell({ company: c }: { company: Company }) {
  const [pending, start] = useTransition();
  if (c.status === 'archived') return null;
  return (
    <button
      type="button"
      className="iconbtn iconbtn--archive"
      title="Archive"
      aria-label={`Archive ${c.name}`}
      disabled={pending}
      onClick={() => start(async () => { await archiveClient(c.id); })}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4" />
      </svg>
    </button>
  );
}

function DeleteCell({ company: c, contacts }: { company: Company; contacts: Contact[] }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const who = primaryContact(contacts, c.id);
  const others = contactsFor(contacts, c.id).length - 1;
  return (
    <>
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
          onConfirm={() => { setConfirming(false); start(async () => { await deleteClient(c.id); }); }}
        />
      ) : null}
    </>
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
