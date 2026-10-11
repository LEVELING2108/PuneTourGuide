import { create } from 'zustand';
import { trackingApi, type TrackingSession } from '../api/safety';
import { rememberPosition } from './permissions';

export type LiveStatus = 'connecting' | 'live' | 'reconnecting';

const MIN_INTERVAL_MS = 3000; // TECH_DESIGN §9.5: publish every ~3 s
const HEARTBEAT_MS = 15000; // resend the last fix so watchers know we are still here

/**
 * Publishes this phone's location to a tracking session: authenticates with its first message
 * (the token never goes in a URL), sends GPS fixes at most every 3 s, and reconnects with
 * backoff when the network drops. Stops the GPS when stopped.
 */
export class LivePublisher {
  private ws: WebSocket | null = null;
  private watchId: number | null = null;
  private last: { lat: number; lng: number; acc?: number } | null = null;
  private lastSent = 0;
  private heartbeat: number | null = null;
  private retry = 0;
  private stopped = false;

  constructor(
    readonly session: TrackingSession,
    private readonly onStatus: (s: LiveStatus) => void = () => undefined
  ) {}

  start(initial?: { lat: number; lng: number }) {
    if (initial) this.last = initial;
    this.connect();
    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (p) => {
          this.last = { lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy };
          rememberPosition(p.coords.latitude, p.coords.longitude);
          if (Date.now() - this.lastSent >= MIN_INTERVAL_MS) this.send();
        },
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 }
      );
    }
    this.heartbeat = window.setInterval(() => this.send(), HEARTBEAT_MS);
  }

  private connect() {
    if (this.stopped) return;
    this.onStatus(this.retry ? 'reconnecting' : 'connecting');
    const ws = new WebSocket(trackingApi.socketUrl(this.session.session_id));
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      ws.send(JSON.stringify({ type: 'auth', token: this.session.publish_token }));
      this.onStatus('live');
      this.send();
    };
    ws.onclose = () => {
      if (this.stopped) return;
      this.onStatus('reconnecting');
      const delay = Math.min(30000, 1000 * 2 ** this.retry++);
      window.setTimeout(() => this.connect(), delay);
    };
    ws.onerror = () => ws.close();
  }

  private send() {
    if (!this.last || this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(this.last));
    this.lastSent = Date.now();
  }

  /** Stop publishing; `close` also ends the session so watchers see "sharing ended". */
  stop(close = true) {
    this.stopped = true;
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    if (this.heartbeat !== null) window.clearInterval(this.heartbeat);
    this.ws?.close();
    if (close) void trackingApi.close(this.session);
  }
}

type LiveState = {
  /** Plan → Share live trip */
  trip: { sessionId: string; sharedWith: string[] } | null;
  status: LiveStatus | null;
  set: (patch: Partial<Omit<LiveState, 'set'>>) => void;
};

/** What the UI shows about live sharing (Plan toggle, Map "Live sharing", Directions line). */
export const useLiveStore = create<LiveState>()((set) => ({ trip: null, status: null, set: (patch) => set(patch) }));

let tripPublisher: LivePublisher | null = null;
export const getTripPublisher = () => tripPublisher;
export const setTripPublisher = (p: LivePublisher | null) => {
  tripPublisher = p;
};

/** "Aai", "Aai and Aman", "Aai, Aman and 2 more" */
export function namesText(names: string[]) {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} more`;
}
