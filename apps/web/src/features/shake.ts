import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { usePermissionStore } from '../stores/permissions';
import { useSettingsStore } from '../stores/settings';

/** RoadSoS threshold: |acceleration incl. gravity| above 15 m/s² is a jolt (gravity alone is ~9.8). */
const JOLT = 15;
/** A deliberate shake = 3 jolts within 1.5 s. One jolt (a pothole, a dropped phone) is not enough. */
const JOLTS_NEEDED = 3;
const WINDOW_MS = 1500;
const MIN_GAP_MS = 120; // samples of the same jolt do not count twice
const COOLDOWN_MS = 1000;

/** Pure detector, exported for tests: feed it magnitudes with timestamps. */
export function createShakeDetector(onShake: () => void) {
  let jolts: number[] = [];
  let lastFire = -Infinity;
  return (magnitude: number, now: number) => {
    if (magnitude < JOLT) return;
    if (jolts.length && now - jolts[jolts.length - 1] < MIN_GAP_MS) return;
    jolts = [...jolts.filter((t) => now - t <= WINDOW_MS), now];
    if (jolts.length >= JOLTS_NEEDED && now - lastFire > COOLDOWN_MS) {
      lastFire = now;
      jolts = [];
      onShake();
    }
  };
}

/** Shake to SOS (TECH_DESIGN §9.5): only when the setting is on and motion access was granted. */
export function useShakeToSos() {
  const enabled = useSettingsStore((s) => s.shakeToSos);
  const motion = usePermissionStore((s) => s.motion);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onSos = useRef(pathname === '/sos');
  onSos.current = pathname === '/sos';

  useEffect(() => {
    if (!enabled || !motion || typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return;
    const detect = createShakeDetector(() => {
      if (onSos.current) return; // a countdown is already running
      navigator.vibrate?.(200);
      navigate('/sos?via=shake');
    });
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x === null || a.y === null || a.z === null) return;
      detect(Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z), e.timeStamp || performance.now());
    };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [enabled, motion, navigate]);
}
