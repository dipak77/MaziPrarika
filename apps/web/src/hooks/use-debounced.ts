'use client';

/**
 * A tiny debounce hook.
 *
 * The studio types into the canvas on every keystroke; rebuilding a 400-node
 * scene 12 times a second is wasted work on a phone. `useDebounced` keeps the
 * input responsive (it is controlled by the store, so typing never lags) and
 * lets the expensive derivation — the SVG — settle a moment later.
 */

import { useEffect, useState } from 'react';

export function useDebounced<T>(value: T, delayMs = 160): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    // A pending edit is flushed immediately when the delay is zero.
    if (delayMs <= 0) {
      setSettled(value);
      return;
    }
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
}
