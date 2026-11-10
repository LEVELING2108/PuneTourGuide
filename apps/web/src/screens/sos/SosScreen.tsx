import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { medicalApi } from '../../api/medical';
import { trackingApi, type TrackingSession } from '../../api/safety';
import { sosApi } from '../../api/sos';
import { Themed } from '../../components/Themed';
import { cachedContacts, useContacts } from '../../features/contacts';
import { isMedical, useHelpNearby } from '../../features/help';
import { LivePublisher } from '../../features/live';
import { useCurrentPosition } from '../../features/location';
import { medicalSummary, smsHref, sosText, trackLink } from '../../features/phoneSms';
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
type Active = {
  key: string;
  startedAt: number;
  session: TrackingSession | null;
  alert: 'sending' | 'sent' | 'failed';
  alerted: number;
  /** The messaging app was opened for this SOS (only once by itself; the button can open it again). */
  texted?: boolean;
};

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
  // Browsers refuse (and log an error) until the person has touched the page
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return;
  try {
    navigator.vibrate?.(p);
  } catch {
    /* not supported */
  }
};

export default function SosScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const loggedIn = useIsLoggedIn();
  // "Text contacts from my phone" (stored under its first name, smsWhenOffline)
  const textFromPhone = useSettingsStore((s) => s.smsWhenOffline);
  const contactsQ = useContacts();
  const contacts = loggedIn && contactsQ.data ? contactsQ.data : cachedContacts();
  const pos = useCurrentPosition();
  const helpQ = useHelpNearby(pos.known ? pos : null);
  const medicalQ = useQuery({ queryKey: ['medical'], queryFn: medicalApi.get, enabled: loggedIn, staleTime: 10 * 60_000 });

  const [active, setActiveState] = useState<Active | null>(loadActive);
  const [count, setCount] = useState(active ? 0 : COUNTDOWN);
  const [fix, setFix] = useState<{ lat: number; lng: number } | null>(null);
  const fired = useRef(!!active);
  // Left the page (the 112 call) since this SOS fired: coming back opens the messaging app
  const wentAway = useRef(!!active);
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && fired.current) wentAway.current = true;
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

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

  const med = medicalQ.data;
  const medicalText = med?.saved ? (med.bloodGroup ? t('sos.medical', { group: med.bloodGroup }) : med.showOnLockScreen ? t('sos.medicalNoGroup') : '') : '';

  const here = fix ?? (pos.known ? pos : null);
  const hospital = (helpQ.data ?? [])
    .filter(isMedical)
    .filter((h) => h.category === 'hospital')
    .map((h) => ({ ...h, km: here ? Math.round((metres(here, h) / 1000) * 10) / 10 : h.km }))[0];

  // After the call: the messaging app with every contact and the alert filled in, sent from this
  // phone's own SIM (reaches any number, needs signal but no data). The server's texts are a backup.
  const textHref =
    active && active.alert !== 'sending' && contacts.length
      ? smsHref(
          contacts.map((c) => c.phone),
          sosText({
            link: active.session ? trackLink(active.session.session_id) : null,
            at: here,
            hospital: hospital ? { name: hospital.name, km: hospital.km } : null,
            medical: medicalSummary(med?.saved ? med : null),
          })
        )
      : null;
  const openText = useCallback(() => {
    if (!textHref || !active) return;
    if (!active.texted) setActive({ ...active, texted: true });
    window.location.href = textHref;
  }, [textHref, active, setActive]);
  useEffect(() => {
    if (!textFromPhone || !textHref || active?.texted) return;
    if (wentAway.current && document.visibilityState === 'visible') {
      openText();
      return;
    }
    const onBack = () => {
      if (document.visibilityState === 'visible' && wentAway.current) openText();
    };
    document.addEventListener('visibilitychange', onBack);
    return () => document.removeEventListener('visibilitychange', onBack);
  }, [textFromPhone, textHref, active?.texted, openText]);

  // ── Lines under the countdown (translated: this screen must be understood in a crisis) ──
  const names = contacts.map((c) => c.name);
  const namesText =
    names.length <= 2 ? names.join(t('and')) : `${names.slice(0, 2).join(', ')}${t('more', { count: names.length - 2 })}`;
  let line1: { pre: string; bold: string; post: string; href?: string | null };
  if (!contacts.length) line1 = { pre: t('sos.noContacts'), bold: '112', post: active ? t('sos.isBeingCalled') : t('sos.willBeCalled') };
  else if (active?.alert === 'failed')
    line1 = textHref
      ? { pre: t('sos.serverDown'), bold: t('sos.textContacts'), post: '', href: textHref }
      : { pre: t('sos.alertFailed'), bold: t('sos.callThemAfter'), post: '' };
  else if (active?.alert === 'sent' && active.alerted > 0) line1 = { pre: '', bold: namesText, post: t('sos.alerted') };
  else if (active?.alert === 'sent' && textHref) line1 = { pre: t('sos.textTo'), bold: namesText, post: '', href: textHref };
  else if (active?.alert === 'sent') line1 = { pre: t('sos.loginToAlert'), bold: '112', post: t('sos.isBeingCalled') };
  else line1 = { pre: t('sos.liveTo'), bold: namesText, post: '' };

  const v = {
    count,
    counting: !active && count > 0,
    calling: !!active,
    kicker: active ? (active.session ? t('sos.kicker.live') : t('sos.kicker.active')) : params.get('via') === 'shake' ? t('sos.kicker.shake') : t('sos.kicker.sos'),
    headline: active ? t('sos.callingHeadline') : t('sos.countingHeadline'),
    offset: String(Math.round(603 * (1 - Math.max(0, count) / COUNTDOWN))),
    line1Pre: line1.pre,
    line1Bold: line1.bold,
    line1Post: line1.post,
    line1Href: line1.href ?? null,
    hospitalPre: hospital ? t('sos.nearest') : here ? t('sos.finding') : t('sos.ambulance'),
    hospitalBold: hospital ? `${hospital.name}, ${kmText(hospital.km)}` : here ? '' : t('sos.call108'),
    medicalText,
    ambulanceLabel: t('sos.ambulanceLabel'),
    policeLabel: t('sos.policeLabel'),
    womenLabel: t('sos.womenLabel'),
    callNowLabel: t('sos.callNow'),
    cancelLabel: t('sos.cancel'),
    textHref,
    textLabel: t('sos.textButton'),
    openText: (e: React.MouseEvent) => {
      e.preventDefault();
      openText();
    },
    callNow: (e: React.MouseEvent) => {
      if (active) return; // already fired: let the link dial again
      e.preventDefault();
      fire();
    },
    cancel,
  };
  return <Themed classic={SOSView} deccan={DeccanSOSView} v={v} />;
}
