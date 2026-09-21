'use client';

import { useState } from 'react';
import type { UpworkLead, UpworkInvoice } from '@/lib/upwork';
import {
  byActivity, clientsOnly, moneyFor, money, shortDate,
  CONTRACT_LABEL, CONTRACT_TONE, ROOM_LABEL,
} from '@/lib/upwork';
import { useColumnWidths, ResizeHandle } from '@/components/table';

/**
 * The two Upwork tables.
 *
 * Same ruled grid as the client table, in the Upwork violet. Both filter
 * from one search box rather than a control per column — with four hundred
 * conversations, typing a name is faster than any filter menu.
 */

// ------------------------------------------------------------------ search

function Search({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <label className="clientsearch">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function Count({ shown, total, noun }: { shown: number; total: number; noun: string }) {
  return (
    <p className="muted tablecount">
      {shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`}
    </p>
  );
}

// ---------------------------------------------------------------- messages

const MSG_COLS = ['Name', 'Type', 'Last message', 'Awaiting reply', 'Became a client', ''] as const;
const MSG_WIDTHS = [300, 100, 150, 140, 150, 90];

export function MessagesTable({ leads }: { leads: UpworkLead[] }) {
  const [q, setQ] = useState('');
  const { widths, resize } = useColumnWidths('lifework.upwork.messages.cols', MSG_WIDTHS);

  const needle = q.trim().toLowerCase();
  const rows = byActivity(leads).filter((l) => !needle || l.name.toLowerCase().includes(needle));

  return (
    <>
      <div className="tablebar">
        <Search value={q} onChange={setQ} placeholder="Search conversations" />
        <Count shown={rows.length} total={leads.length} noun="conversations" />
      </div>
      <section className="card ctable__wrap">
        <table className="ctable ctable--violet" style={{ width: widths.reduce((a, b) => a + b, 0) }}>
          <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
          <thead>
            <tr>
              {MSG_COLS.map((label, i) => (
                <th key={i} aria-label={label || 'Open in Upwork'}>
                  {label}
                  <ResizeHandle onResize={(dx) => resize(i, widths[i] + dx)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={MSG_COLS.length} className="ctable__empty">No match.</td></tr>
            ) : rows.map((l) => (
              <tr key={l.id} className="ctable__row">
                <td title={l.name}>{l.name}</td>
                <td>{l.roomType ? (ROOM_LABEL[l.roomType] ?? l.roomType) : <span className="muted">—</span>}</td>
                <td>{shortDate(l.lastActivityAt)}</td>
                <td>
                  {l.awaitingReply
                    ? <span className="muted">{l.awaitingReply === 'you' ? 'You' : 'Them'}</span>
                    : <span className="muted">—</span>}
                </td>
                <td>
                  {l.contractId
                    ? <span className="status status--active">Yes</span>
                    : <span className="muted">No</span>}
                </td>
                <td>
                  {l.roomUrl
                    ? <a className="ctable__link" href={l.roomUrl} target="_blank" rel="noreferrer">Open ↗</a>
                    : <span className="muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

// ----------------------------------------------------------------- clients

const CLI_COLS = ['Client', 'Contract', 'Signed', 'Status', 'Invoiced', 'Earned', ''] as const;
const CLI_WIDTHS = [230, 280, 115, 105, 125, 125, 85];

export function UpworkClientsTable({ leads, invoices }: {
  leads: UpworkLead[];
  invoices: UpworkInvoice[];
}) {
  const [q, setQ] = useState('');
  const { widths, resize } = useColumnWidths('lifework.upwork.clients.cols', CLI_WIDTHS);

  const all = clientsOnly(leads)
    .map((l) => {
      const m = moneyFor(invoices, l.id);
      // The invoice rows are the record. When none carry this room — a
      // contract that never billed, or one Upwork bills under another name —
      // the total stored on the lead is what there is.
      const billed = m.years > 0 ? m.billed : Number(l.billedTotal);
      const earned = m.years > 0 ? m.earned : Number(l.earnedTotal);
      return { lead: l, billed, earned };
    })
    .sort((a, b) => b.earned - a.earned);

  const needle = q.trim().toLowerCase();
  const rows = all.filter(({ lead }) =>
    !needle
    || lead.name.toLowerCase().includes(needle)
    || (lead.contractTitle ?? '').toLowerCase().includes(needle));

  const totalBilled = rows.reduce((s, r) => s + r.billed, 0);
  const totalEarned = rows.reduce((s, r) => s + r.earned, 0);

  return (
    <>
      <div className="tablebar">
        <Search value={q} onChange={setQ} placeholder="Search clients" />
        <Count shown={rows.length} total={all.length} noun="clients" />
      </div>
      <section className="card ctable__wrap">
        <table className="ctable ctable--violet" style={{ width: widths.reduce((a, b) => a + b, 0) }}>
          <colgroup>{widths.map((w, i) => <col key={i} style={{ width: w }} />)}</colgroup>
          <thead>
            <tr>
              {CLI_COLS.map((label, i) => (
                <th
                  key={i}
                  aria-label={label || 'Open in Upwork'}
                  className={i === 4 || i === 5 ? 'ctable__num' : undefined}
                >
                  {label}
                  <ResizeHandle onResize={(dx) => resize(i, widths[i] + dx)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={CLI_COLS.length} className="ctable__empty">No match.</td></tr>
            ) : rows.map(({ lead: l, billed, earned }) => (
              <tr key={l.id} className="ctable__row">
                <td title={l.name}>{l.name}</td>
                <td title={l.contractTitle ?? ''}>
                  {l.contractTitle ?? <span className="muted">—</span>}
                </td>
                <td>{shortDate(l.firstContactAt)}</td>
                <td>
                  {l.contractStatus ? (
                    <span className={`status status--${CONTRACT_TONE[l.contractStatus] ?? 'archived'}`}>
                      {CONTRACT_LABEL[l.contractStatus] ?? l.contractStatus}
                    </span>
                  ) : <span className="muted">—</span>}
                </td>
                <td className="ctable__num">{money(billed, l.rateCurrency)}</td>
                <td className="ctable__num">{money(earned, l.rateCurrency)}</td>
                <td>
                  {l.roomUrl
                    ? <a className="ctable__link" href={l.roomUrl} target="_blank" rel="noreferrer">Open ↗</a>
                    : <span className="muted">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 ? (
            <tfoot>
              <tr className="ctable__total">
                <td colSpan={4}>{needle ? 'Total, these rows' : 'Total, all time'}</td>
                <td className="ctable__num">{money(totalBilled)}</td>
                <td className="ctable__num">{money(totalEarned)}</td>
                <td />
              </tr>
            </tfoot>
          ) : null}
        </table>
      </section>
    </>
  );
}
