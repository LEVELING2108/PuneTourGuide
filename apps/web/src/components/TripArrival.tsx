import type { Stop } from '../api/itinerary';
import { Sheet } from './Sheet';

/** "You've arrived at Shaniwar Wada. Mark visited (+40 XP)?" The sheet's Cancel means "not yet". */
export function ArrivalSheet({ stop, onVisit, onLater }: { stop: Stop; onVisit: () => void; onLater: () => void }) {
  return (
    <Sheet title={`You've arrived at ${stop.place.name}`} detail={`Mark it visited to collect its stamp (+${stop.place.xp} XP).`} onClose={onLater}>
      <button
        className="sheet-option"
        onClick={onVisit}
        style={{ height: '56px', marginTop: '4px', borderRadius: '28px', border: 'none', background: 'var(--primary)', color: 'var(--surface)', fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}
      >
        Mark visited
      </button>
    </Sheet>
  );
}
