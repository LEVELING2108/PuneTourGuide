import { useEffect, useState } from 'react';

/**
 * "Install again" after the move to app.puneexplorer.dev: the landing page sends home-screen icons
 * installed from the old address here with ?install=1. Read once at start, before the first-launch
 * redirect drops the query.
 */
const askedAtStart = typeof location !== 'undefined' && new URLSearchParams(location.search).get('install') === '1';
export const installAsked = () => askedAtStart;

type InstallEvent = Event & { prompt: () => Promise<void> };
let deferred: InstallEvent | null = null;
const listeners = new Set<() => void>();

/** Keep Chrome's install event for the button. Only when asked: everyone else keeps the browser's own prompt. */
export function startInstallCapture() {
  if (!askedAtStart) return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallEvent;
    listeners.forEach((l) => l());
  });
}

export const isInstalled = () => window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** The browser's install dialog, when it offered one (Chrome, Edge, Samsung Internet). */
export function useInstallEvent() {
  const [event, setEvent] = useState(deferred);
  useEffect(() => {
    const update = () => setEvent(deferred);
    listeners.add(update);
    return () => void listeners.delete(update);
  }, []);
  return event;
}
