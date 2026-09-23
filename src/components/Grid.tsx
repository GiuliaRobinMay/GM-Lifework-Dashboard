'use client';

import type { ReactNode } from 'react';
import { useColumnWidths, ResizeHandle } from '@/components/table';

/**
 * The grid, after Airtable.
 *
 * White cells, white header, and no fill anywhere: the structure is carried
 * entirely by three line weights — columns, rows, and the heavier rule under
 * the header. Rows are 32px. The first column carries the record number on
 * its left, the way Airtable folds the number into the primary field.
 *
 * It starts at the top left of its container with no padding and no card, so
 * the first line runs the whole width.
 */

export type FieldType = 'text' | 'number' | 'currency' | 'date' | 'select' | 'link' | 'check';

export type Column<T> = {
  key: string;
  label: string;
  type: FieldType;
  width: number;
  /** Right-aligns the cell. Numbers and money read down the column. */
  numeric?: boolean;
  /** A column of buttons: no field glyph, no name, no resize edge. */
  bare?: boolean;
  render: (row: T) => ReactNode;
};

/** A fold: a run of rows behind one heading you can close. */
export type Group<T> = {
  key: string;
  head: ReactNode;
  rows: T[];
  open: boolean;
  onToggle: () => void;
  empty?: string;
};

export function Grid<T>({
  rows = [], columns, rowKey, store, empty = 'Nothing here.', groups, rowClass,
}: {
  rows?: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  /** Where this grid's column widths are remembered, per browser. */
  store: string;
  empty?: string;
  /** Folds. When given they replace `rows`, and rows number within a fold. */
  groups?: Group<T>[];
  rowClass?: (row: T) => string | undefined;
}) {
  const { widths, resize } = useColumnWidths(store, columns.map((c) => c.width));
  const total = widths.reduce((a, b) => a + b, 0);

  /** The rows of one run — the whole table, or one fold of it. */
  function body(list: T[], none: string) {
    if (list.length === 0) {
      return <tr><td colSpan={columns.length + 1} className="grid2__empty">{none}</td></tr>;
    }
    return list.map((row, n) => (
      <tr key={rowKey(row)} className={rowClass?.(row)}>
        {columns.map((c, i) => (
          <td
            key={c.key}
            className={[c.numeric ? 'grid2__num' : '', c.bare ? 'grid2__bare' : '']
              .filter(Boolean).join(' ') || undefined}
          >
            {i === 0 ? <span className="grid2__rownum">{n + 1}</span> : null}
            {c.render(row)}
          </td>
        ))}
        <td className="grid2__filler" />
      </tr>
    ));
  }

  return (
    <div className="grid2">
      <div className="grid2__scroll">
        {/* The table is 100% wide with a minimum of its columns, and carries a
            trailing filler cell. That is what makes every rule run the whole
            width of the page rather than stopping at the last field. */}
        <table className="grid2__table" style={{ minWidth: total }}>
          <colgroup>
            {widths.map((w, i) => <col key={i} style={{ width: w }} />)}
            <col />
          </colgroup>
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={[c.numeric ? 'grid2__num' : '', c.bare ? 'grid2__bare' : '']
                    .filter(Boolean).join(' ') || undefined}
                  aria-label={c.bare ? c.label : undefined}
                >
                  {i === 0 ? <span className="grid2__check" aria-hidden="true" /> : null}
                  {c.bare ? null : (
                    <span className="grid2__field">
                      <FieldIcon type={c.type} />
                      <span className="grid2__fieldname">{c.label}</span>
                    </span>
                  )}
                  {c.bare ? null : <ResizeHandle onResize={(dx) => resize(i, widths[i] + dx)} />}
                </th>
              ))}
              <th className="grid2__filler" aria-hidden="true" />
            </tr>
          </thead>
          {groups ? groups.map((g) => (
            <tbody key={g.key} className="grid2__group">
              <tr className="grid2__fold">
                <td colSpan={columns.length + 1}>
                  <button type="button" className="grid2__foldbtn" aria-expanded={g.open} onClick={g.onToggle}>
                    <span className="grid2__caret" aria-hidden="true">{g.open ? '\u25be' : '\u25b8'}</span>
                    {g.head}
                    <span className="grid2__count">{g.rows.length}</span>
                  </button>
                </td>
              </tr>
              {g.open ? body(g.rows, g.empty ?? empty) : null}
            </tbody>
          )) : <tbody>{body(rows, empty)}</tbody>}
        </table>
      </div>
    </div>
  );
}

/**
 * The field-type glyph in front of a column name.
 *
 * Airtable draws the type, not a decoration: A for text, # for a number,
 * the currency sign for money. Keeping that means the header says what the
 * column holds before you have read a single row.
 */
function FieldIcon({ type }: { type: FieldType }) {
  const common = {
    viewBox: '0 0 16 16',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (type) {
    case 'number':
      return <svg className="grid2__ficon" {...common}><path d="M5.5 2.5 4 13.5M11 2.5 9.5 13.5M2.5 5.5h11M2 10.5h11" /></svg>;
    case 'currency':
      return <svg className="grid2__ficon" {...common}><path d="M8 1.8v12.4M11 4.5c-.6-.9-1.7-1.4-3-1.4-1.7 0-2.8.8-2.8 2.1 0 3 5.8 1.5 5.8 4.6 0 1.4-1.2 2.3-3 2.3-1.4 0-2.6-.5-3.2-1.5" /></svg>;
    case 'date':
      return <svg className="grid2__ficon" {...common}><rect x="2" y="3" width="12" height="11" rx="1.6" /><path d="M2 6.5h12M5.5 1.8v2.4M10.5 1.8v2.4" /></svg>;
    case 'select':
      return <svg className="grid2__ficon" {...common}><circle cx="8" cy="8" r="6" /><path d="m5.5 8 1.8 1.9L10.5 6.4" /></svg>;
    case 'check':
      return <svg className="grid2__ficon" {...common}><rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2" /><path d="m5.2 8.2 1.9 1.9 3.7-4" /></svg>;
    case 'link':
      return <svg className="grid2__ficon" {...common}><path d="M6.8 9.2a2.6 2.6 0 0 0 3.7 0l2-2a2.6 2.6 0 1 0-3.7-3.7L7.9 4.4" /><path d="M9.2 6.8a2.6 2.6 0 0 0-3.7 0l-2 2a2.6 2.6 0 1 0 3.7 3.7l.9-.9" /></svg>;
    case 'text':
    default:
      return <svg className="grid2__ficon" {...common}><path d="M2.6 13 7.2 3h1.6L13.4 13M4.6 9.4h6.8" /></svg>;
  }
}
