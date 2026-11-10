import { useState } from 'react';
import { installAsked, isInstalled, useInstallEvent } from '../features/install';
import { Sheet } from './Sheet';

const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/** Shown once after the move, to people whose old home-screen icon brought them here (?install=1). */
export function InstallPrompt({ asked = installAsked() }: { asked?: boolean }) {
  const [open, setOpen] = useState(() => asked && !isInstalled());
  const event = useInstallEvent();
  if (!open) return null;
  const close = () => setOpen(false);
  const install = async () => {
    await event?.prompt().catch(() => undefined);
    close();
  };
  const how = isIos() ? 'Tap Share, then “Add to Home Screen”.' : 'Open the browser menu (⋮) and tap “Install app” or “Add to Home screen”.';
  return (
    <Sheet
      title="Install Pune Explorer again"
      detail="Pune Explorer moved to app.puneexplorer.dev. Install it from here so SOS keeps working offline, then remove the old icon and sign in again."
      onClose={close}
    >
      {event ? (
        <button
          className="sheet-option"
          onClick={install}
          style={{ height: '56px', marginTop: '4px', borderRadius: '28px', border: 'none', background: 'var(--primary)', color: 'var(--surface)', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
        >
          Install
        </button>
      ) : (
        <p style={{ margin: '4px 0 0', fontSize: '15px', lineHeight: 1.4 }}>{how}</p>
      )}
    </Sheet>
  );
}
