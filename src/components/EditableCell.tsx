'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

/**
 * A cell you can type into.
 *
 * Reads as its value. Click the empty part of the cell, double-click it, or
 * hit the pencil to edit in place; Enter or leaving the field saves, Escape
 * throws the edit away. A link stays clickable — the anchor opens the page,
 * the space around it opens the editor.
 */
export function EditableCell({
  value, kind, label, onSave,
}: {
  value: string | null;
  kind: 'text' | 'link';
  label: string;
  onSave: (value: string) => Promise<{ error: string | null }>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setDraft(value ?? ''); }, [value, editing]);
  useEffect(() => { if (editing) input.current?.select(); }, [editing]);

  function commit() {
    const next = draft.trim();
    setEditing(false);
    if (next === (value ?? '')) return;
    setError(null);
    start(async () => {
      const r = await onSave(next);
      if (r.error) setError(r.error);
    });
  }

  if (editing) {
    return (
      <span className="cell">
        <input
          ref={input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { e.preventDefault(); setDraft(value ?? ''); setEditing(false); }
          }}
          aria-label={label}
          autoFocus
        />
      </span>
    );
  }

  const open = () => { setError(null); setEditing(true); };
  // A click on the link follows the link, on the pencil presses the pencil;
  // anywhere else in the cell opens the editor. Same for a double-click.
  const onPlain = (e: React.MouseEvent) => {
    if (!(e.target as Element).closest('a, button')) open();
  };

  return (
    <span
      className={pending ? 'cell cell--pending' : 'cell'}
      onClick={onPlain}
      onDoubleClick={onPlain}
    >
      {value ? (
        kind === 'link'
          ? (
            <a
              className="grid2__link cell__text"
              href={value}
              target="_blank"
              rel="noreferrer"
              // The second click of a double-click would open the page again.
              onClick={(e) => { if (e.detail > 1) e.preventDefault(); }}
            >
              {value}
            </a>
          )
          : <span className="cell__text">{value}</span>
      ) : (
        <span className="cell__text grid2__dash">—</span>
      )}
      {error ? <span className="cell__error" role="alert" title={error}>{error}</span> : null}
      <button type="button" className="cell__edit" aria-label={`Edit ${label}`} onClick={open}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11.3 2.3a1.6 1.6 0 0 1 2.4 2.4L5.5 12.9 2 13.9l1-3.5z" /><path d="M10 3.6 12.4 6" />
        </svg>
      </button>
    </span>
  );
}
