import { useCallback, useEffect, useRef, useState } from 'react';
import { Sheet } from './Sheet';

type Ask = { title: string; detail?: string; confirm: string };

/** Yes / Cancel bottom sheet. */
export function ConfirmSheet({ title, detail, confirm, onAnswer }: Ask & { onAnswer: (yes: boolean) => void }) {
  const yes = useRef<HTMLButtonElement>(null);
  useEffect(() => yes.current?.focus(), []);
  return (
    <Sheet title={title} detail={detail} onClose={() => onAnswer(false)}>
      <button
        ref={yes}
        className="sheet-option"
        onClick={() => onAnswer(true)}
        style={{ height: '56px', marginTop: '4px', borderRadius: '28px', border: 'none', background: 'var(--primary)', color: 'var(--surface)', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
      >
        {confirm}
      </button>
    </Sheet>
  );
}

/** `ask` resolves true on confirm, false on cancel; render `sheet` next to the screen's view. */
export function useConfirm() {
  const [req, setReq] = useState<(Ask & { resolve: (yes: boolean) => void }) | null>(null);
  const ask = useCallback((a: Ask) => new Promise<boolean>((resolve) => setReq({ ...a, resolve })), []);
  const onAnswer = useCallback(
    (yes: boolean) => {
      req?.resolve(yes);
      setReq(null);
    },
    [req]
  );
  const sheet = req ? <ConfirmSheet title={req.title} detail={req.detail} confirm={req.confirm} onAnswer={onAnswer} /> : null;
  return { ask, sheet };
}
