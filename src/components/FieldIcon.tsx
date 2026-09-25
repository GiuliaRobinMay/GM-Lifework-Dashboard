import type { FieldType } from '@/lib/grid';

/**
 * The field-type glyph in front of a column name.
 *
 * Airtable draws the type, not a decoration: A for text, # for a number,
 * the currency sign for money. Keeping that means the header says what the
 * column holds before you have read a single row.
 */
export function FieldIcon({ type }: { type: FieldType }) {
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
