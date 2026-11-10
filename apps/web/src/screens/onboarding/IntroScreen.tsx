import { useCallback, useRef, useState } from 'react';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import { markOnboarded } from '../../stores/onboarding';
import IntroView from '../../views/classic/Intro.view';
import DeccanIntroView from '../../views/deccan/DeccanIntro.view';

export default function IntroScreen() {
  const p = usePalette();
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement | null>(null);

  const trackRef = useCallback((el: HTMLDivElement | null) => {
    track.current = el;
  }, []);

  const v = {
    dots: [0, 1, 2].map((k) => ({
      w: k === i ? '22px' : '6px',
      bg: k === i ? (i === 2 ? '#A3281A' : p.ink) : p.dotOff,
    })),
    isLast: i === 2,
    notLast: i !== 2,
    trackRef,
    onSlide: (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const n = Math.max(0, Math.min(2, Math.round(el.scrollLeft / el.clientWidth)));
      if (n !== i) setI(n);
    },
    next: () => {
      const n = Math.min(2, i + 1);
      const el = track.current;
      if (el?.scrollTo) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' });
      else setI(n);
    },
    // Leaving the intro (Skip, Get started, Log in) means it was seen
    done: markOnboarded,
  };

  return <Themed classic={IntroView} deccan={DeccanIntroView} v={v} />;
}
