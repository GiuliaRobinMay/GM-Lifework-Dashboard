'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Domain, IconName, Accent } from '@/lib/nav';
import { ICON_CHOICES, ACCENT_CHOICES } from '@/lib/nav';
import { Icon } from '@/components/Icon';
import { saveDomainSettings } from '@/app/d/actions';

/**
 * The gear at the right of the identity bar.
 *
 * One setting so far: what this domain is called, the icon it carries and
 * the colour it wears. The menu exists so there is somewhere for the next
 * one to go, not because a single item needs a menu.
 */
export function DomainSettings({ domain }: { domain: Domain }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  // Click anywhere else, or press Escape, and the menu closes.
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  return (
    <div className="dsettings" ref={wrap}>
      <button
        type="button"
        className="dsettings__btn"
        aria-label={`${domain.label} settings`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.9 1.9M7.4 16.6l-1.9 1.9M18.5 18.5l-1.9-1.9M7.4 7.4 5.5 5.5" />
        </svg>
      </button>

      {open ? (
        <div className="dsettings__menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="dsettings__item"
            onClick={() => { setOpen(false); setEditing(true); }}
          >
            Edit name, icon and colour
          </button>
        </div>
      ) : null}

      {editing ? <EditDialog domain={domain} onClose={() => setEditing(false)} /> : null}
    </div>
  );
}

function EditDialog({ domain, onClose }: { domain: Domain; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [name, setName] = useState(domain.label);
  const [icon, setIcon] = useState<IconName>(domain.icon);
  const [accent, setAccent] = useState<Accent>(domain.accent);
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
      const r = await saveDomainSettings(domain.slug, { name, icon, accent });
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
        <p className="dialog__title">Edit {domain.label}</p>

        <label className="field">
          <span>Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus
          />
        </label>

        <fieldset className="field">
          <legend>Icon</legend>
          <div className="pickgrid">
            {ICON_CHOICES.map((n) => (
              <button
                key={n}
                type="button"
                className={`pickgrid__icon${n === icon ? ' is-on' : ''} accent-${accent}`}
                aria-label={n}
                aria-pressed={n === icon}
                onClick={() => setIcon(n)}
              >
                <Icon name={n} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Colour</legend>
          <div className="pickrow">
            {ACCENT_CHOICES.map((a) => (
              <button
                key={a}
                type="button"
                className={`pickrow__swatch accent-${a}${a === accent ? ' is-on' : ''}`}
                aria-label={a}
                aria-pressed={a === accent}
                onClick={() => setAccent(a)}
              />
            ))}
          </div>
        </fieldset>

        {error ? <p className="field__error" role="alert">{error}</p> : null}

        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={() => ref.current?.close()}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={pending}>
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
