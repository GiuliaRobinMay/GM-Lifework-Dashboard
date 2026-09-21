'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { Company, Contact, ClientStatus } from '@/lib/crm';
import {
  STATUS_LABEL, STATUS_ORDER, STATUS_OPEN_BY_DEFAULT,
  fullName, primaryContact, contactsFor,
} from '@/lib/crm';
import { setStatus } from '@/app/d/clients/actions';

/**
 * The client table.
 *
 * Grouped by status in Notion's order, each group a fold with its count.
 * DONE and ARCHIVE start folded. Every cell is ruled, because a client list
 * is something you scan down and across, not read as prose.
 *
 * The status cell is a select: pick another status and the row moves to that
 * group. That is the one thing this table writes.
 */
export function ClientTable({ companies, contacts }: { companies: Company[]; contacts: Contact[] }) {
  const [open, setOpen] = useState<Record<ClientStatus, boolean>>({ ...STATUS_OPEN_BY_DEFAULT });

  const groups = STATUS_ORDER.map((status) => ({
    status,
    rows: companies
      .filter((c) => c.status === status)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return (
    <table className="ctable">
      <thead>
        <tr>
          <th>Community</th>
          <th>Client</th>
          <th>Status</th>
          <th>Mighty Networks</th>
          <th>Upwork</th>
        </tr>
      </thead>
      {groups.map(({ status, rows }) => (
        <tbody key={status} className={`ctable__group ctable__group--${status}`}>
          <tr className="ctable__head">
            <td colSpan={5}>
              <button
                type="button"
                className="ctable__fold"
                aria-expanded={open[status]}
                onClick={() => setOpen((o) => ({ ...o, [status]: !o[status] }))}
              >
                <span className="ctable__caret" aria-hidden="true">{open[status] ? '▾' : '▸'}</span>
                <span className={`status status--${status}`}>{STATUS_LABEL[status]}</span>
                <span className="ctable__count">{rows.length}</span>
              </button>
            </td>
          </tr>
          {open[status] ? rows.map((c) => (
            <ClientRow key={c.id} company={c} contacts={contacts} />
          )) : null}
          {open[status] && rows.length === 0 ? (
            <tr><td colSpan={5} className="ctable__empty">Nothing here.</td></tr>
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

  function move(next: ClientStatus) {
    setError(null);
    start(async () => {
      const r = await setStatus(c.id, next);
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
          onChange={(e) => move(e.target.value as ClientStatus)}
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
    </tr>
  );
}
