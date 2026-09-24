'use client';

import { useEffect } from 'react';

/**
 * Registers the offline shell — production only.
 *
 * In development a service worker would serve yesterday's HTML over the dev
 * server's fresh render, which is exactly the kind of ghost-file confusion that
 * wastes an afternoon.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        /* offline shell is a bonus, never a blocker */
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);

  return null;
}
