import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { renderGoogleButton, type GoogleContext } from '../features/google';
import { useSettingsStore } from '../stores/settings';

type Props = {
  context: GoogleContext;
  onToken: (idToken: string) => void;
  /** Called with a message when the stand-in is tapped because Google's button isn't available. */
  onUnavailable: (message: string) => void;
  className?: string;
  style?: CSSProperties;
  /** The themed stand-in button, shown until Google's own button is drawn (or if it can't be). */
  children: ReactNode;
};

/** Google's official sign-in button, with the screen's own button standing in until it loads. */
export function GoogleButton({ context, onToken, onUnavailable, className, style, children }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const tokenRef = useRef(onToken);
  tokenRef.current = onToken;
  const language = useSettingsStore((s) => s.language);
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    let live = true;
    if (!wrap.current || !slot.current) return;
    setReady(false);
    renderGoogleButton(slot.current, {
      context,
      width: wrap.current.offsetWidth,
      locale: language,
      onToken: (t) => tokenRef.current(t),
    })
      .then(() => live && setReady(true))
      .catch((e: unknown) => live && setProblem(e instanceof Error ? e.message : 'Google sign-in could not load.'));
    return () => {
      live = false;
    };
  }, [context, language]);

  const standIn = (e: React.MouseEvent) => {
    e.preventDefault();
    onUnavailable(problem || 'Google sign-in is still loading. Try again in a moment.');
  };

  return (
    <div ref={wrap} className={className} style={{ height: '54px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <div ref={slot} style={{ display: ready ? 'flex' : 'none', justifyContent: 'center', width: '100%' }} />
      {!ready && (
        <div onClickCapture={standIn} style={{ width: '100%' }}>
          {children}
        </div>
      )}
    </div>
  );
}
