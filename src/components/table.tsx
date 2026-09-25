'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The bits every ruled table here shares: a drag edge on the header cells,
 * and column widths remembered in this browser so a table opens the way it
 * was left. Extracted so a second table does not mean a second copy.
 */

const MIN_WIDTH = 56;

export function useColumnWidths(store: string, defaults: number[]) {
  const [widths, setWidths] = useState<number[]>(defaults);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(store) ?? 'null');
      if (Array.isArray(saved) && saved.length === defaults.length) setWidths(saved);
    } catch { /* a bad value falls back to the defaults */ }
    // Defaults are a module constant; re-reading on every render is not wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  // Takes the movement, not the new width: a drag fires many times before
  // React re-renders, so a width computed outside setState is stale by the
  // second event and only the last few pixels of the drag would stick.
  function resize(i: number, dx: number) {
    setWidths((prev) => {
      const next = [...prev];
      next[i] = Math.max(MIN_WIDTH, Math.round(prev[i] + dx));
      try { localStorage.setItem(store, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }

  return { widths, resize };
}

/** The drag edge on a header cell. Horizontal movement only. */
export function ResizeHandle({ onResize }: { onResize: (dx: number) => void }) {
  const last = useRef(0);
  function down(e: React.MouseEvent) {
    e.preventDefault();
    last.current = e.clientX;
    const move = (ev: MouseEvent) => {
      const dx = ev.clientX - last.current;
      last.current = ev.clientX;
      onResize(dx);
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }
  return <span className="ctable__grip" onMouseDown={down} aria-hidden="true" />;
}
