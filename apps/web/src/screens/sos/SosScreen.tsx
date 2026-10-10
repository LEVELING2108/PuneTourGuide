import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { trackingApi, type TrackingSession } from '../../api/safety';
import { sosApi } from '../../api/sos';
import { Themed } from '../../components/Themed';
import { cachedContacts, useContacts } from '../../features/contacts';
import { isMedical, useHelpNearby } from '../../features/help';
import { LivePublisher, namesText } from '../../features/live';
import { useCurrentPosition } from '../../features/location';
import { getPosition, lastPosition, rememberPosition } from '../../features/permissions';
import { kmText } from '../../features/places';
import { metres } from '../../lib/geo';
import { useIsLoggedIn } from '../../stores/auth';
import { useSettingsStore } from '../../stores/settings';
import SOSView from '../../views/classic/SOS.view';
import DeccanSOSView from '../../views/deccan/DeccanSOS.view';

const COUNTDOWN = 5;
const ACTIVE_KEY = 'pe_sos_active';

/** The SOS in progress on this tab. Survives a reload so 112 is never dialled twice by accident. */
type Active = { key: string; startedAt: number; session: TrackingSession | null; alert: 'sending' | 'sent' | 'failed'; alerted: number };

const loadActive = (): Active | null => {
  try {
    const a = JSON.parse(sessionStorage.getItem(ACTIVE_KEY) ?? 'null') as Active | null;
    return a && Date.now() - a.startedAt < 6 * 3600_000 ? a : null;
  } catch {
    return null;
  }
};
const saveActive = (a: Active | null) => {
  try {
    if (a) sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(a));
    else sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* private mode: the SOS still works, it just will not survive a reload */
  }
};

let publisher: LivePublisher | null = null;

/** A fresh high-accuracy fix if it comes quickly, else the last known one, else none. */
async function bestFix(): Promise<{ lat: number; lng: number; acc?: number } | null> {
  try {
    const p = await getPosition({ enableHighAccuracy: true, timeout: 4000, maximumAge: 15000 });
    rememberPosition(p.coords.latitude, p.coords.longitude);
    return { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
  } catch {
    const last = lastPosition();
    return last.known ? { lat: last.lat, lng: last.lng } : null;
  }
}

const vibrate = (p: number | number[]) => {
  try {
    navigator.vibrate?.(p);
  } catch {
    /* not supported */
  }
};

/** Text for the primary contact when the alert could not reach the server (works with no data). */
function smsFallback(primary: { phone: string } | undefined, fix: { lat: number; lng: number } | null) {
  if (!primary) return null;
  const where = fix ? `I'm at https://maps.google.com/?q=${fix.lat.toFixed(5)},${fix.lng.toFixed(5)}` : 'I could not get my location.';
  const body = `SOS: I need help. ${where} Please call me or 112.`;
  // "?&body=" works on both Android and iOS
  return `sms:${primary.phone}?&body=${encodeURIComponent(body)}`;
}

export default function SosScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const loggedIn = useIsLoggedIn();
  const smsWhenOffline = useSettingsStore((s) => s.smsWhenOffline);
  const contactsQ = useContacts();
  const contacts = loggedIn && contactsQ.data ? contactsQ.data : cachedContacts();
  const primary = contacts.find((c) => c.isPrimary) ?? contacts[0];
  const pos = useCurrentPosition();
  const helpQ = useHelpNearby(pos.known ? pos : null);

  const [active, setActiveState] = useState<Active | null>(loadActive);
  const [count, setCount] = useState(active ? 0 : COUNTDOWN);
  const [fix, setFix] = useState<{ lat: number; lng: number } | null>(null);
  const fired = useRef(!!active);

  const setActive = useCallback((a: Active | null) => {
    saveActive(a);
    setActiveState(a);
  }, []);

  // Resume publishing after a reload of an active SOS
  useEffect(() => {
    if (active?.session && !publisher) {
      publisher = new LivePublisher(active.session);
      publisher.start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** At zero (TECH_DESIGN §9.5): the phone dials 112 itself; everything else is best-effort on top. */
  const fire = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    vibrate([400, 150, 400]);
    const key = crypto.randomUUID();
    let a: Active = { key, startedAt: Date.now(), session: null, alert: 'sending', alerted: 0 };
    setActive(a);
    setCount(0);

    // 1. Dial. Works offline, needs no server.
    window.location.href = 'tel:112';

    // 2. Live location + alert to contacts, in parallel with the call.
    void (async () => {
      const f = await bestFix();
      setFix(f);
      let session: TrackingSession | null = null;
      try {
        session = await trackingApi.create();
        publisher = new LivePublisher(session);
        publisher.start(f ?? undefined);
      } catch {
        session = null;
      }
      a = { ...a, session };
      setActive(a);
      try {
        const r = await sosApi.alert(key, {
          sessionId: session?.session_id ?? crypto.randomUUID(),
          ...(f ? { lat: f.lat, lng: f.lng } : {}),
        });
        a = { ...a, alert: 'sent', alerted: r.contactsAlerted };
      } catch {
        a = { ...a, alert: 'failed' };
      }
      setActive(a);
    })();
  }, [setActive]);

  // Countdown with a haptic tick each second
  useEffect(() => {
    if (active || count <= 0) return;
    vibrate(80);
    const t = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [count, active]);
  useEffect(() => {
    if (count === 0 && !active) fire();
  }, [count, active, fire]);

  // No data? After the call, open a text to the primary contact with the coordinates.
  const smsHref = active?.alert === 'failed' && smsWhenOffline ? smsFallback(primary, fix) : null;
  useEffect(() => {
    if (!smsHref) return;
    const onBack = () => {
      if (document.visibilityState === 'visible') {
        window.location.href = smsHref;
        document.removeEventListener('visibilitychange', onBack);
      }
    };
    document.addEventListener('visibilitychange', onBack);
    return () => document.removeEventListener('visibilitychange', onBack);
  }, [smsHref]);

  const cancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    vibrate(60);
    if (!active) {
      // Countdown stopped: nothing was sent
      fired.current = true;
      if (window.history.length > 1) navigate(-1);
      else navigate('/', { replace: true });
      return;
    }
    publisher?.stop(true);
    publisher = null;
    if (active.alert !== 'failed') await sosApi.cancel(active.key).catch(() => undefined);
    setActive(null);
    navigate('/', { replace: true });
  };

  // ── Lines under the countdown ─────────────────────────────────
  const names = contacts.map((c) => c.name);
  let line1: { pre: string; bold: string; post: string; href?: string | null };
  if (!contacts.length) line1 = { pre: 'No emergency contacts saved · ', bold: '112', post: active ? ' is being called' : ' will be called' };
  else if (active?.alert === 'failed')
    line1 = smsHref
      ? { pre: "Couldn't reach the server · ", bold: `Text ${primary!.name} your location`, post: '', href: smsHref }
      : { pre: "Couldn't alert contacts online · ", bold: 'call them after 112', post: '' };
  else if (active?.alert === 'sent' && active.alerted > 0) line1 = { pre: '', bold: namesText(names), post: ' alerted with your live location' };
  else if (active?.alert === 'sent') line1 = { pre: 'Contacts are alerted only when you are logged in · ', bold: '112', post: ' is being called' };
  else line1 = { pre: 'Live location going to ', bold: namesText(names), post: '' };

  const here = fix ?? (pos.known ? pos : null);
  const hospital = (helpQ.data ?? [])
    .filter(isMedical)
    .filter((h) => h.category === 'hospital')
    .map((h) => ({ ...h, km: here ? Math.round((metres(here, h) / 1000) * 10) / 10 : h.km }))[0];

  const v = {
    count,
    counting: !active && count > 0,
    calling: !!active,
    kicker: active ? (active.session ? 'LIVE LOCATION ON' : 'SOS ACTIVE') : params.get('via') === 'shake' ? 'SHAKE DETECTED' : 'SOS',
    headline: active ? 'Calling 112' : 'Calling 112 in',
    offset: String(Math.round(603 * (1 - Math.max(0, count) / COUNTDOWN))),
    line1Pre: line1.pre,
    line1Bold: line1.bold,
    line1Post: line1.post,
    line1Href: line1.href ?? null,
    hospitalPre: hospital ? 'Nearest trauma care: ' : here ? 'Finding the nearest hospital… ' : 'Ambulance: ',
    hospitalBold: hospital ? `${hospital.name}, ${kmText(hospital.km)}` : here ? '' : 'call 108',
    medicalText: '',
    callNow: (e: React.MouseEvent) => {
      if (active) return; // already fired: let the link dial again
      e.preventDefault();
      fire();
    },
    cancel,
  };
  return <Themed classic={SOSView} deccan={DeccanSOSView} v={v} />;
}
