import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { sosApi } from '../../api/sos';
import type { Stop } from '../../api/itinerary';
import { ArrivalSheet } from '../../components/TripArrival';
import { useTripWatch } from '../../features/tripWatch';
import { useConfirm } from '../../components/Confirm';
import { DeccanOnly } from '../../components/Themed';
import { useAccountRequired } from '../../features/account';
import { lastPosition } from '../../features/permissions';
import { placeTone, usePlan } from '../../features/places';
import { namesText, useLiveStore } from '../../features/live';
import { closedNote, googleDayUrl, metres, nextStop, progress, stopNumber, travelGuess } from '../../features/tripLogic';
import { shareTrackLink, useStartDay, useTripActions, useTripRun, useTripStore } from '../../features/tripMode';
import { isNoContacts, useTripShare } from '../../features/trip';
import { googleDirectionsUrl } from '../../lib/googleMaps';
import { useFlash } from '../../lib/useFlash';
import { useUser } from '../../stores/auth';
import { useTheme } from '../../stores/theme';

const css = `
@keyframes trip-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.trip .rise{animation:trip-rise .55s cubic-bezier(.2,.7,.2,1) both}
.trip .tap{transition:transform .15s}
.trip .tap:active{transform:scale(.97)}
@keyframes trip-toast{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.trip .toast{animation:trip-toast .3s ease both}
@media (prefers-reduced-motion:reduce){.trip .rise,.trip .toast{animation:none}}
`;

const IDLE_MS = 2 * 3600_000;

const kicker: CSSProperties = { fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.16em', color: 'var(--muted)' };
const card: CSSProperties = { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '22px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' };
const primaryBtn: CSSProperties = {
  flexShrink: 0,
  height: '52px',
  borderRadius: '26px',
  border: 'none',
  background: 'var(--primary)',
  color: 'var(--surface)',
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  textDecoration: 'none',
  cursor: 'pointer',
};
const outlineBtn: CSSProperties = { ...primaryBtn, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line)' };
const textBtn: CSSProperties = { height: '40px', border: 'none', background: 'transparent', color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', padding: '0 4px' };

function Icon({ d, size = 17 }: { d: string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {d.map((p) => (
        <path key={p} d={p} />
      ))}
    </svg>
  );
}
const ICON = {
  back: ['M15 5l-7 7 7 7'],
  nav: ['M3 11l18-8-8 18-2-8-8-2z'],
  ext: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
  check: ['M5 12l5 5L20 7'],
  share: ['M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7', 'M12 3v13', 'M7 8l5-5 5 5'],
};

function Note({ tone, children }: { tone: 'warn' | 'info'; children: ReactNode }) {
  const warn = tone === 'warn';
  return (
    <div role="status" style={{ borderRadius: '14px', padding: '10px 12px', fontSize: '12.5px', lineHeight: 1.45, background: warn ? '#FDF0E1' : 'color-mix(in srgb, var(--primary) 9%, var(--surface))', color: warn ? '#6E3A0E' : 'var(--ink)', border: `1px solid ${warn ? '#EBC9A0' : 'var(--line)'}` }}>
      {children}
    </div>
  );
}

const statusText = { sent: 'Sent', failed: "Couldn't text", queued: 'Sending…' } as const;
const statusColor = { sent: '#2FA58A', failed: 'var(--sos)', queued: 'var(--muted)' } as const;

/** Trip mode (TECH_DESIGN §9.14): the day's next stop, arrival, progress, live share and the day's summary. Both themes. */
export default function TripScreen() {
  const theme = useTheme();
  const loggedIn = useAccountRequired();
  const navigate = useNavigate();
  const user = useUser();
  const plan = usePlan(loggedIn);
  const { run, day, queued, loading } = useTripRun(plan.data);
  const finished = useTripStore((s) => s.finished);
  const lastMoveAt = useTripStore((s) => s.lastMoveAt);
  const shareSession = useTripStore((s) => s.shareSession);
  const actions = useTripActions();
  const startDay = useStartDay();
  const share = useTripShare();
  const liveTrip = useLiveStore((s) => s.trip);
  const { ask, sheet } = useConfirm();
  const toast = useFlash(3200);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const stops = day?.stops ?? [];
  const skipped = run?.skipped ?? [];
  const next = run ? nextStop(stops, skipped) : null;
  const prog = progress(stops, skipped);
  const xpToday = stops.filter((s) => s.done).reduce((n, s) => n + s.place.xp, 0);
  const watch = useTripWatch(next);

  // A message from the Plan tab (e.g. sharing did not start)
  const notice = (useLocation().state as { notice?: string } | null)?.notice;
  useEffect(() => {
    if (notice) toast.flash(notice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const delivery = useQuery({
    queryKey: ['delivery', liveTrip?.sessionId],
    queryFn: () => sosApi.tripDelivery(liveTrip!.sessionId),
    enabled: !!liveTrip,
    refetchInterval: (q) => (q.state.data?.contacts.some((c) => c.status === 'queued') || !q.state.data ? 4000 : false),
  });

  const visit = async (stop: Stop) => {
    watch.dismiss();
    const r = await actions.visit(stop.id);
    toast.flash(r.synced ? (r.stamp ? `${stop.place.name} visited · stamp collected, +${r.xp} XP` : `${stop.place.name} visited`) : `${stop.place.name} visited · saved, will sync when you're online`);
  };

  const skip = async (stop: Stop, undo = false) => {
    const r = await actions.skip(stop.id, !undo);
    toast.flash(undo ? `${stop.place.name} is back on today's list` : r.synced ? `Skipped ${stop.place.name}` : `Skipped ${stop.place.name} · will sync when you're online`);
  };

  const endDay = async (reason: 'user' | 'complete') => {
    if (reason === 'user') {
      const left = prog.left;
      const yes = await ask({
        title: 'End the day?',
        detail: `${left ? `${left} ${left === 1 ? 'place is' : 'places are'} still to visit. ` : ''}${shareSession && liveTrip?.sessionId === shareSession ? 'Live sharing stops too.' : ''}`.trim() || undefined,
        confirm: 'End day',
      });
      if (!yes) return;
    }
    setBusy(true);
    try {
      await actions.end(reason);
    } finally {
      setBusy(false);
    }
  };

  const toggleShare = () =>
    share
      .toggle()
      .then((r) => {
        useTripStore.getState().set({ shareSession: r.on ? useLiveStore.getState().trip?.sessionId ?? null : null });
        toast.flash(r.on ? `Sending your live link to ${namesText(r.sharedWith ?? [])}…` : 'Stopped sharing your location');
      })
      .catch((err) => {
        if (isNoContacts(err)) navigate('/settings/contacts/new');
        else toast.flash(err instanceof Error ? err.message : 'Could not start sharing');
      });

  const sendYourself = async () => {
    if (!liveTrip) return;
    const r = await shareTrackLink(liveTrip.sessionId, user?.name ?? 'Your friend');
    if (r === 'copied') toast.flash('Link copied · paste it in WhatsApp or a text');
  };

  const shell = (children: ReactNode) => (
    <div className={`scr scr-${theme}-Trip trip`} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: 'var(--bg)', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <style href="trip" precedence="screens">{css}</style>
      <DeccanOnly>
        <svg width="100%" height="10" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <defs>
            <pattern id="trip-zari" width="12" height="10" patternUnits="userSpaceOnUse">
              <rect width="12" height="10" fill="var(--gold)" />
              <path d="M0 10 L6 2 L12 10 Z" fill="var(--primary)" />
            </pattern>
          </defs>
          <rect width="100%" height="10" fill="url(#trip-zari)" />
        </svg>
      </DeccanOnly>
      <div data-scroll="" style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 'calc(var(--sab) + 32px)' }}>
        <div style={{ padding: 'calc(var(--sb) + 14px) 24px 0', display: 'flex', flexDirection: 'column', gap: '18px' }}>{children}</div>
      </div>
      {toast.show && (
        <div key={toast.key} className="toast" role="status" style={{ position: 'absolute', left: '24px', right: '24px', bottom: 'calc(var(--sab) + 24px)', padding: '13px 16px', borderRadius: '16px', background: 'var(--ink)', color: 'var(--bg)', fontSize: '13px', boxShadow: '0 16px 30px -14px rgba(0,0,0,0.5)', zIndex: 5 }}>
          {toast.text}
        </div>
      )}
      {watch.arrived && <ArrivalSheet stop={watch.arrived} onVisit={() => void visit(watch.arrived!)} onLater={watch.dismiss} />}
      {sheet}
    </div>
  );

  const header = (title: string, sub: string) => (
    <div className="rise" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <Link to="/plan" aria-label="Back to plan" style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '22px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon d={ICON.back} />
      </Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <div style={kicker}>{sub}</div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, lineHeight: 1 }}>{title}</h1>
      </div>
    </div>
  );

  if (!loggedIn) return shell(<div style={{ fontSize: '13.5px', color: 'var(--muted)' }}>Loading your trip…</div>);
  if (!run && !finished && !loading) return <Navigate to="/plan" replace />;

  // ── Day finished: summary ───────────────────────────────────────
  if (!run && finished?.summary) {
    const s = finished.summary;
    const days = plan.data ?? [];
    const following = days.find((d) => d.day === finished.dayNumber + 1 && d.stops.some((x) => !x.done));
    const hours = s.minutes >= 60 ? `${Math.floor(s.minutes / 60)} h ${s.minutes % 60} min` : `${s.minutes} min`;
    const stat = (value: string, label: string) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '34px', lineHeight: 1 }}>{value}</span>
        <span style={{ fontSize: '12px', opacity: 0.75 }}>{label}</span>
      </div>
    );
    return shell(
      <>
        {header(`Day ${finished.dayNumber} done`, finished.endReason === 'auto' ? 'ENDED AUTOMATICALLY' : 'TRIP SUMMARY')}
        <div className="rise" style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: '24px', padding: '22px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          {stat(String(s.placesVisited), s.placesVisited === 1 ? 'place visited' : 'places visited')}
          {stat(`+${s.xpEarned}`, 'XP earned')}
          {stat(s.km ? `${s.km}` : '–', 'km between places')}
          {stat(hours, 'out exploring')}
        </div>
        {finished.endReason === 'auto' && <Note tone="info">This trip ended by itself after the day was over.</Note>}
        {following ? (
          <button
            className="rise tap"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await startDay(following);
              } catch (err) {
                toast.flash(err instanceof Error ? err.message : 'Could not start the day');
              } finally {
                setBusy(false);
              }
            }}
            style={primaryBtn}
          >
            {`Start Day ${following.day} · ${following.stops.length} ${following.stops.length === 1 ? 'place' : 'places'}`}
          </button>
        ) : null}
        <Link to="/plan" className="rise tap" onClick={() => useTripStore.getState().set({ finished: null })} style={outlineBtn}>
          Back to plan
        </Link>
      </>
    );
  }

  if (!run) return shell(<div style={{ fontSize: '13.5px', color: 'var(--muted)' }}>Loading your trip…</div>);

  // ── Trip under way ──────────────────────────────────────────────
  const here = watch.here ?? (lastPosition().known ? lastPosition() : null);
  const away = next && here && next.place.lat != null && next.place.lng != null ? metres(here, { lat: next.place.lat, lng: next.place.lng }) : null;
  const closed = next ? closedNote(next.place) : null;
  const remaining = stops.filter((s) => !s.done && !skipped.includes(s.id));
  const dayLink = googleDayUrl(remaining);
  const idle = lastMoveAt != null && now - lastMoveAt > IDLE_MS;
  const pct = prog.total ? Math.round(((prog.done + prog.skipped) / prog.total) * 100) : 0;

  return shell(
    <>
      {header(next ? `Stop ${stopNumber(stops, next)} of ${stops.length}` : 'All done', `DAY ${run.dayNumber} · ON YOUR WAY`)}

      <div className="rise" style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: '22px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', fontSize: '13px' }}>
          <span>{`${prog.done} of ${prog.total} visited${prog.skipped ? ` · ${prog.skipped} skipped` : ''}`}</span>
          <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{`+${xpToday} XP`}</span>
        </div>
        <div style={{ height: '6px', borderRadius: '3px', background: 'color-mix(in srgb, var(--bg) 18%, transparent)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '6px', borderRadius: '3px', background: 'var(--gold)', transition: 'width .4s' }} />
        </div>
      </div>

      {queued > 0 && <Note tone="info">Saved on your phone · will sync when you're back online.</Note>}
      {idle && (
        <Note tone="warn">
          Still on your trip? You haven't moved in a while.{' '}
          <button onClick={() => void endDay('user')} style={{ ...textBtn, height: 'auto', color: '#6E3A0E', textDecoration: 'underline', padding: 0 }}>
            End day
          </button>
        </Note>
      )}

      {next ? (
        <div className="rise" style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ height: '8px', background: placeTone(next.place.category, theme) }} />
          <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={kicker}>NEXT STOP</div>
              {next.place.id ? (
                <Link to={`/place/${next.place.id}`} style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1.05, color: 'var(--ink)', textDecoration: 'none' }}>
                  {next.place.name}
                </Link>
              ) : (
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1.05 }}>{next.place.name}</div>
              )}
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                {[next.place.area, away != null ? travelGuess(away) : next.place.lat == null ? 'No map location for this stop' : 'Finding your location…'].filter(Boolean).join(' · ')}
              </div>
            </div>
            {closed && <Note tone="warn">{closed}</Note>}
            {next.place.weakSignal && <Note tone="warn">Weak signal there. The app keeps working; ticks sync later. Check help nearby before you go.</Note>}
            {next.place.lat != null && next.place.lng != null && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/directions/${next.id}?trip=1`} className="tap" style={{ ...primaryBtn, flex: 1 }}>
                  <Icon d={ICON.nav} />
                  Directions
                </Link>
                <a href={googleDirectionsUrl({ lat: next.place.lat, lng: next.place.lng }, away != null && away < 1500 ? 'walk' : 'auto')} target="_blank" rel="noreferrer" className="tap" style={{ ...outlineBtn, flex: 1 }}>
                  Google Maps
                  <Icon d={ICON.ext} size={15} />
                </a>
              </div>
            )}
            <button className="tap" onClick={() => void visit(next)} style={outlineBtn}>
              <Icon d={ICON.check} />
              {`I'm here · mark visited +${next.place.xp} XP`}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>We'll ask when you arrive, while the app is open.</span>
              <button onClick={() => void skip(next)} style={textBtn}>
                Skip
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rise" style={card}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1.05 }}>That's the day!</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{`You visited ${prog.done} of ${prog.total} places${prog.skipped ? ` and skipped ${prog.skipped}` : ''}.`}</div>
          <button className="tap" disabled={busy} onClick={() => void endDay('complete')} style={primaryBtn}>
            {busy ? 'Finishing…' : 'Finish day'}
          </button>
        </div>
      )}

      <div className="rise" style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: '22px', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ fontSize: '14.5px', fontWeight: 600 }}>Live trip</div>
            <div style={{ fontSize: '12.5px', opacity: 0.7 }}>{liveTrip ? 'Your contacts can follow you on a map' : 'Off · nobody can see your location'}</div>
          </div>
          <button onClick={toggleShare} disabled={share.busy} aria-pressed={liveTrip ? 'true' : 'false'} style={{ height: '36px', padding: '0 14px', borderRadius: '18px', border: '1px solid color-mix(in srgb, var(--bg) 30%, transparent)', background: 'transparent', color: 'var(--bg)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {share.busy ? '…' : liveTrip ? 'Stop' : 'Share'}
          </button>
        </div>
        {liveTrip && (
          <>
            {(delivery.data?.contacts ?? liveTrip.sharedWith.map((name) => ({ name, status: 'queued' as const }))).map((c) => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span>{c.name}</span>
                <span style={{ fontWeight: 600, color: statusColor[c.status] }}>{statusText[c.status]}</span>
              </div>
            ))}
            {delivery.data?.contacts.some((c) => c.status === 'failed') && (
              <div style={{ fontSize: '12.5px', color: '#F3B4A8' }}>Some texts did not go. Send the link yourself so they can follow you.</div>
            )}
            <button className="tap" onClick={() => void sendYourself()} style={{ ...primaryBtn, height: '44px', background: 'var(--bg)', color: 'var(--ink)', fontSize: '14px' }}>
              <Icon d={ICON.share} size={16} />
              Send the link yourself
            </button>
          </>
        )}
      </div>

      <div className="rise" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ ...kicker, marginBottom: '6px' }}>{`TODAY · ${stops.length} ${stops.length === 1 ? 'PLACE' : 'PLACES'}`}</div>
        {stops.map((s, i) => {
          const isSkipped = !s.done && skipped.includes(s.id);
          const isNext = next?.id === s.id;
          return (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i === stops.length - 1 ? 'none' : '1px solid var(--line)', opacity: s.done || isSkipped ? 0.6 : 1 }}>
              <span aria-hidden="true" style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, background: s.done ? 'var(--primary)' : isNext ? 'var(--ink)' : 'transparent', color: s.done || isNext ? 'var(--surface)' : 'var(--muted)', border: s.done || isNext ? 'none' : '1px solid var(--line)' }}>
                {s.done ? <Icon d={ICON.check} size={14} /> : i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14.5px', fontWeight: 600, textDecoration: isSkipped ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.place.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{s.done ? 'Visited' : isSkipped ? 'Skipped' : isNext ? 'Next' : s.time}</div>
              </div>
              {isSkipped && (
                <button onClick={() => void skip(s, true)} style={textBtn}>
                  Undo
                </button>
              )}
            </div>
          );
        })}
      </div>

      {dayLink && (
        <a href={dayLink.url} target="_blank" rel="noreferrer" className="rise tap" style={outlineBtn}>
          {dayLink.more ? `Open the next ${dayLink.count} stops in Google Maps` : remaining.length > 1 ? 'Open the whole day in Google Maps' : 'Open in Google Maps'}
          <Icon d={ICON.ext} size={15} />
        </a>
      )}
      <button className="rise" disabled={busy} onClick={() => void endDay('user')} style={{ ...textBtn, alignSelf: 'center', color: 'var(--sos)' }}>
        End day
      </button>
    </>
  );
}
