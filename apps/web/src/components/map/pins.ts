import { esc } from '../../lib/geo';

/**
 * Marker HTML matching the Map / Navigation mockups. Each wrapper is translated so the
 * visual anchor (dot centre, circle centre, stem tip) sits on the coordinate; the inner
 * element carries the mockup's `pin` drop animation. Colours are theme variables.
 */
const wrap = (tx: string, inner: string) => `<div style="position:absolute;left:0;top:0;transform:${tx}">${inner}</div>`;

/** Place label: dot + name. `active` = in your plan (filled primary). */
export function placePin(name: string, active: boolean, shadow: string, delay = 0) {
  const bg = active ? 'var(--primary)' : 'var(--surface)';
  const fg = active ? 'var(--bg)' : 'var(--ink)';
  const dot = active ? 'var(--bg)' : 'var(--primary)';
  return wrap(
    'translate(-14px,-50%)',
    `<div class="pin" style="animation-delay:${delay}s;display:flex;align-items:center;gap:6px;padding:6px 12px 6px 8px;border-radius:16px;background:${bg};color:${fg};box-shadow:${shadow};white-space:nowrap;cursor:pointer">` +
      `<span style="width:12px;height:12px;border-radius:6px;background:${dot}"></span>` +
      `<span style="font-family:var(--font-display);font-size:15px">${esc(name)}</span></div>`
  );
}

export type StopPinKind = 'done' | 'next' | 'weak' | 'later';

/** Numbered route stop. */
export function stopPin(n: number, kind: StopPinKind, doneColor: string, primaryShadow: string) {
  const size = kind === 'done' ? 28 : 32;
  const styles: Record<StopPinKind, string> = {
    done: `background:${doneColor};border:2.5px solid var(--surface);color:var(--surface);font-size:12px`,
    next: `background:var(--primary);border:2.5px solid var(--surface);color:var(--surface);font-size:13px;box-shadow:${primaryShadow}`,
    weak: 'background:var(--surface);border:2.5px solid #C27A1E;color:#8A4A12;font-size:13px',
    later: 'background:var(--surface);border:2.5px solid var(--primary);color:var(--primary);font-size:13px',
  };
  return wrap(
    'translate(-50%,-50%)',
    `<div class="pin" style="width:${size}px;height:${size}px;border-radius:${size / 2}px;box-sizing:border-box;font-weight:700;display:flex;align-items:center;justify-content:center;${styles[kind]}">${n}</div>`
  );
}

/** Leg duration label ("8 min", or amber "55 min · weak signal"). */
export function legPin(text: string, weak: boolean) {
  const style = weak
    ? 'background:#FDF0E1;color:#8A4A12;border:1px solid #EBC9A0'
    : 'background:var(--ink);color:var(--bg)';
  return wrap('translate(-50%,-50%)', `<div class="pin" style="padding:4px 10px;border-radius:12px;font-size:11.5px;font-weight:600;white-space:nowrap;${style}">${esc(text)}</div>`);
}

/** Hospital (red cross) or police / fire (shield). SOS red is never themed. */
export function helpPin(kind: 'medical' | 'police', shieldColor: string) {
  const inner =
    kind === 'medical'
      ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" stroke-width="3.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'
      : '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--surface)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>';
  const bg = kind === 'medical' ? 'background:#C8321C;box-shadow:0 8px 18px -6px rgba(200,50,28,0.6)' : `background:${shieldColor}`;
  return wrap(
    'translate(-50%,-50%)',
    `<div class="pin" style="width:30px;height:30px;border-radius:15px;${bg};border:2.5px solid var(--surface);box-sizing:border-box;display:flex;align-items:center;justify-content:center;cursor:pointer">${inner}</div>`
  );
}

/** You are here: blue dot with the pulsing halo (`.me` in the screen CSS). */
export function mePin(size: 18 | 24, shadow: string) {
  const border = size === 24 ? 4 : 3;
  return wrap(
    'translate(-50%,-50%)',
    `<div class="me" style="position:relative;width:${size}px;height:${size}px;border-radius:${size / 2}px;background:#2F6FD6;border:${border}px solid var(--surface);box-sizing:border-box;box-shadow:${shadow}"></div>`
  );
}

/** Destination label with a stem (Navigation). */
export function destinationPin(name: string) {
  return wrap(
    'translate(-50%,-100%)',
    `<div style="display:flex;flex-direction:column;align-items:center">` +
      `<div style="padding:6px 12px;border-radius:14px;background:var(--primary);color:var(--bg);font-family:var(--font-display);font-size:16px;white-space:nowrap">${esc(name)}</div>` +
      `<div style="width:1.5px;height:10px;background:var(--primary)"></div></div>`
  );
}
