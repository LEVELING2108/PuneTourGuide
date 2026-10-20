import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlan } from '../features/places';
import { defaultDayId } from '../features/plan';
import { usePlanStore } from '../stores/plan';
import { Sheet } from './Sheet';

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

  return (
    <Sheet title={title} detail={detail} onClose={() => onPick(null)}>
      {plan.isLoading && <div style={{ fontSize: '13px', color: 'var(--muted)', padding: '12px 0' }}>Loading your days…</div>}
      {plan.isError && <div role="alert" style={{ fontSize: '13px', color: 'var(--muted)', padding: '12px 0' }}>Couldn't load your plan. Check your connection and try again.</div>}
      {days.map((d) => {
        const on = d.id === preferred;
        return (
          <button
            key={d.id}
            ref={on ? first : undefined}
            className="sheet-option"
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
    </Sheet>
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
