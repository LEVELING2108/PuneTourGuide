import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlan } from '../features/places';
import { defaultDayId } from '../features/plan';
import { usePlanStore } from '../stores/plan';

const css = `
@keyframes dayPicker-fade{from{opacity:0}to{opacity:1}}
@keyframes dayPicker-rise{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.day-picker{animation:dayPicker-fade .2s ease both}
.day-picker-sheet{animation:dayPicker-rise .3s cubic-bezier(.2,.7,.2,1) both}
.day-picker-option{transition:border-color .2s,background-color .2s}
.day-picker-option:active{transform:scale(.98)}
@media (prefers-reduced-motion:reduce){.day-picker,.day-picker-sheet{animation:none}}
`;

const stopsText = (n: number) => (n === 0 ? 'Nothing planned yet' : `${n} ${n === 1 ? 'stop' : 'stops'}`);

type SheetProps = { title: string; detail?: string; onPick: (dayId: number | null) => void };

/** Bottom sheet: "Add to which day?" with one row per plan day. */
export function DayPickerSheet({ title, detail, onPick }: SheetProps) {
  const plan = usePlan();
  const remembered = usePlanStore((s) => s.dayId);
  const days = plan.data ?? [];
  const preferred = defaultDayId(days, remembered);
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    first.current?.focus();
  }, [preferred]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onPick(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPick]);

  return (
    <div className="day-picker" onClick={() => onPick(null)} style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'color-mix(in srgb, var(--ink) 45%, transparent)', display: 'flex', alignItems: 'flex-end' }}>
      <style href="day-picker" precedence="components">{css}</style>
      <div
        className="day-picker-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-picker-title"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'var(--font-body)', borderRadius: '24px 24px 0 0', padding: '22px 24px calc(24px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 id="day-picker-title" style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 400, lineHeight: 1.05 }}>{title}</h2>
          {detail && <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{detail}</div>}
        </div>
        {plan.isLoading && <div style={{ fontSize: '13px', color: 'var(--muted)', padding: '12px 0' }}>Loading your days…</div>}
        {plan.isError && <div role="alert" style={{ fontSize: '13px', color: 'var(--muted)', padding: '12px 0' }}>Couldn't load your plan. Check your connection and try again.</div>}
        {days.map((d) => {
          const on = d.id === preferred;
          return (
            <button
              key={d.id}
              ref={on ? first : undefined}
              className="day-picker-option"
              onClick={() => onPick(d.id)}
              style={{ minHeight: '60px', padding: '10px 16px', borderRadius: '16px', border: `1.5px solid ${on ? 'var(--primary)' : 'var(--line)'}`, background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{`Day ${d.day} · ${d.weekday}`}</span>
                <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>{stopsText(d.stops.length)}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={on ? 'var(--primary)' : 'var(--muted)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          );
        })}
        <button onClick={() => onPick(null)} style={{ height: '44px', border: 'none', background: 'transparent', color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

/**
 * Ask which plan day to use. `ask` resolves with the day id, or null if cancelled;
 * render `sheet` next to the screen's view. The choice is remembered for the Plan tab.
 */
export function useDayPicker() {
  const [req, setReq] = useState<{ title: string; detail?: string; resolve: (dayId: number | null) => void } | null>(null);
  const setDay = usePlanStore((s) => s.setDay);

  const ask = useCallback(
    (title: string, detail?: string) => new Promise<number | null>((resolve) => setReq({ title, detail, resolve })),
    []
  );

  const onPick = useCallback(
    (dayId: number | null) => {
      if (dayId) setDay(dayId);
      req?.resolve(dayId);
      setReq(null);
    },
    [req, setDay]
  );

  const sheet = req ? <DayPickerSheet title={req.title} detail={req.detail} onPick={onPick} /> : null;
  return { ask, sheet };
}
