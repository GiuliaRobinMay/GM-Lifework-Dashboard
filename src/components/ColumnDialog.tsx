'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { FIELD_TYPES, FIELD_LABEL, type FieldType } from '@/lib/grid';
import { FieldIcon } from '@/components/FieldIcon';

/**
 * Rename a column, or give it a different glyph.
 *
 * The same dialog the domain settings use: name on top, the choices as a
 * grid of glyphs. Saving goes through the caller, who owns the grid's key.
 */
export function ColumnDialog({
  label, icon, onSave, onClose,
}: {
  label: string;
  icon: FieldType;
  onSave: (input: { label: string; icon: FieldType }) => Promise<{ error: string | null }>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [name, setName] = useState(label);
  const [glyph, setGlyph] = useState<FieldType>(icon);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const closed = () => onClose();
    d.addEventListener('close', closed);
    return () => d.removeEventListener('close', closed);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await onSave({ label: name, icon: glyph });
      if (r.error) { setError(r.error); return; }
      router.refresh();
      ref.current?.close();
    });
  }

  return (
    <dialog
      ref={ref}
      className="dialog"
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
    >
      <form className="dialog__body" onSubmit={submit}>
        <p className="dialog__title">Edit column</p>

        <label className="field">
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoFocus />
        </label>

        <fieldset className="field">
          <legend>Icon</legend>
          <div className="pickgrid pickgrid--glyphs">
            {FIELD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`pickgrid__icon${t === glyph ? ' is-on' : ''}`}
                title={FIELD_LABEL[t]}
                aria-label={FIELD_LABEL[t]}
                aria-pressed={t === glyph}
                onClick={() => setGlyph(t)}
              >
                <FieldIcon type={t} />
              </button>
            ))}
          </div>
        </fieldset>

        {error ? <p className="field__error" role="alert">{error}</p> : null}

        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </dialog>
  );
}
