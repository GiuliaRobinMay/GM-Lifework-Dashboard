'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon } from '@/components/Icon';
import type { ClientStatus } from '@/lib/crm';
import { STATUS_LABEL, STATUS_ORDER } from '@/lib/crm';
import { createClient, type NewClient } from '@/app/d/clients/actions';

/**
 * The top bar of the client zone: search the clients, add one.
 *
 * Search is a URL parameter, so the table filters on the server and the
 * address is shareable. Nothing else from the general top bar is here — the
 * command palette and the pinned apps belong to the rest of the environment.
 */
export function ClientsBar({ part = 'both' }: { part?: 'search' | 'add' | 'both' }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [adding, setAdding] = useState(false);

  // Keep the box in step when the URL changes (back button, cleared search).
  useEffect(() => { setQ(params.get('q') ?? ''); }, [params]);

  // Debounced: typing does not navigate on every key.
  useEffect(() => {
    const current = params.get('q') ?? '';
    if (q === current) return;
    const t = setTimeout(() => {
      router.replace(q ? `/d/clients/all?q=${encodeURIComponent(q)}` : '/d/clients/all');
    }, 180);
    return () => clearTimeout(t);
  }, [q, params, router]);

  return (
    <>
      {part !== 'add' ? (
      <label className="clientsearch">
        <SearchIcon />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search clients"
          aria-label="Search clients"
        />
      </label>
      ) : null}
      {part !== 'search' ? (
      <button type="button" className="btn btn--primary" onClick={() => setAdding(true)}>
        + Add client
      </button>
      ) : null}
      {adding ? <AddClientDialog onClose={() => setAdding(false)} /> : null}
    </>
  );
}

const EMPTY: NewClient = {
  name: '', firstName: '', lastName: '', status: 'contact',
  email: '', website: '', communityUrl: '', upworkUrl: '', notes: '',
};

function AddClientDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [form, setForm] = useState<NewClient>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    const onCloseEvt = () => onClose();
    d.addEventListener('close', onCloseEvt);
    return () => d.removeEventListener('close', onCloseEvt);
  }, [onClose]);

  const set = (k: keyof NewClient) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await createClient(form);
      if (r.error) { setError(r.error); return; }
      ref.current?.close();
      if (r.id) router.push(`/d/clients/all/${r.id}`);
    });
  }

  return (
    <dialog
      ref={ref}
      className="dialog dialog--form"
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}
    >
      <form className="dialog__body" onSubmit={submit}>
        <p className="dialog__title">New client</p>

        <div className="field">
          <label htmlFor="nc-name">Community</label>
          <input id="nc-name" required autoFocus value={form.name} onChange={set('name')} placeholder="The community or company name" />
        </div>

        <div className="field field--pair">
          <div>
            <label htmlFor="nc-first">Client — first name</label>
            <input id="nc-first" value={form.firstName} onChange={set('firstName')} />
          </div>
          <div>
            <label htmlFor="nc-last">Last name</label>
            <input id="nc-last" value={form.lastName} onChange={set('lastName')} />
          </div>
        </div>

        <div className="field field--pair">
          <div>
            <label htmlFor="nc-status">Status</label>
            <select id="nc-status" value={form.status} onChange={set('status')}>
              {STATUS_ORDER.map((s: ClientStatus) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="nc-email">Email</label>
            <input id="nc-email" type="email" value={form.email} onChange={set('email')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="nc-community">Mighty Networks / community link</label>
          <input id="nc-community" type="url" value={form.communityUrl} onChange={set('communityUrl')} placeholder="https://" />
        </div>
        <div className="field">
          <label htmlFor="nc-upwork">Upwork link</label>
          <input id="nc-upwork" type="url" value={form.upworkUrl} onChange={set('upworkUrl')} placeholder="https://" />
        </div>
        <div className="field">
          <label htmlFor="nc-website">Website</label>
          <input id="nc-website" type="url" value={form.website} onChange={set('website')} placeholder="https://" />
        </div>
        <div className="field">
          <label htmlFor="nc-notes">Notes</label>
          <textarea id="nc-notes" rows={3} value={form.notes} onChange={set('notes')} />
        </div>

        {error ? <p className="field__error" role="alert">{error}</p> : null}

        <div className="dialog__actions">
          <button type="button" className="btn btn--ghost" onClick={() => ref.current?.close()} disabled={pending}>Cancel</button>
          <button type="submit" className="btn btn--primary" disabled={pending}>{pending ? 'Saving…' : 'Add client'}</button>
        </div>
      </form>
    </dialog>
  );
}
