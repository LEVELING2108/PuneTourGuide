import { useEffect, type ReactNode } from 'react';

const css = `
@keyframes sheet-fade{from{opacity:0}to{opacity:1}}
@keyframes sheet-rise{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
.sheet-backdrop{animation:sheet-fade .2s ease both}
.sheet-panel{animation:sheet-rise .3s cubic-bezier(.2,.7,.2,1) both}
.sheet-option{transition:border-color .2s,background-color .2s}
.sheet-option:active{transform:scale(.98)}
@media (prefers-reduced-motion:reduce){.sheet-backdrop,.sheet-panel{animation:none}}
`;

type Props = { title: string; detail?: string; onClose: () => void; children: ReactNode };

/** Bottom sheet (both themes, theme tokens only): closes on Escape, the backdrop or Cancel. */
export function Sheet({ title, detail, onClose, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sheet-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 20, background: 'color-mix(in srgb, var(--ink) 45%, transparent)', display: 'flex', alignItems: 'flex-end' }}>
      <style href="sheet" precedence="components">{css}</style>
      <div
        className="sheet-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', boxSizing: 'border-box', background: 'var(--surface)', color: 'var(--ink)', fontFamily: 'var(--font-body)', borderRadius: '24px 24px 0 0', padding: '22px 24px calc(24px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 id="sheet-title" style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: 400, lineHeight: 1.05 }}>{title}</h2>
          {detail && <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{detail}</div>}
        </div>
        {children}
        <button onClick={onClose} style={{ height: '44px', border: 'none', background: 'transparent', color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
