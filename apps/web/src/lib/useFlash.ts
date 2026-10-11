import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Toast state as in the mockups: hide, then show again on the next tick so the
 * CSS animation replays, then hide after `ms`.
 */
export function useFlash(ms: number) {
  const [stamp, setStamp] = useState(0);
  const [text, setText] = useState('');
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => clear, []);

  const flash = useCallback(
    (message = '') => {
      clear();
      setStamp(0);
      timers.current.push(
        window.setTimeout(() => {
          setText(message);
          setStamp(Date.now());
        }, 20),
        window.setTimeout(() => setStamp(0), ms)
      );
    },
    [ms]
  );

  return { show: stamp > 0, key: stamp, text, flash };
}
