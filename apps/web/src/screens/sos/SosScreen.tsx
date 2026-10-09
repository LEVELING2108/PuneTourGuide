import { useEffect, useState } from 'react';
import { Themed } from '../../components/Themed';
import SOSView from '../../views/classic/SOS.view';
import DeccanSOSView from '../../views/deccan/DeccanSOS.view';

const COUNTDOWN = 5;

export default function SosScreen() {
  const [count, setCount] = useState(COUNTDOWN);

  useEffect(() => {
    if (count <= 0) return;
    const t = window.setTimeout(() => setCount((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [count]);

  const v = {
    count,
    counting: count > 0,
    calling: count <= 0,
    headline: count > 0 ? 'Calling 112 in' : 'Connecting to 112',
    offset: String(Math.round(603 * (1 - count / COUNTDOWN))),
  };
  return <Themed classic={SOSView} deccan={DeccanSOSView} v={v} />;
}
