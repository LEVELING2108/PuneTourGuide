import { useNavigate, useParams } from 'react-router';
import { Themed } from '../../components/Themed';
import { nearParam, useCurrentPosition } from '../../features/location';
import { kmText, usePlace, useRequireLogin, useTogglePlan, useToggleSave } from '../../features/places';
import { usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import { useTheme } from '../../stores/theme';
import PlaceView from '../../views/classic/Place.view';
import DeccanPlaceView from '../../views/deccan/DeccanPlace.view';
import { googlePlaceUrl } from '../../lib/googleMaps';

/** "8:00 AM - 6:30 PM" → "8 AM–6:30 PM" so it fits the 3-column fact row. */
// "9:00 AM - 5:30 PM" → "9 AM–5:30 PM"; each time stays whole and the line may wrap after the dash
const compactHours = (h: string) =>
  h
    .replace(/:00(?= ?[AP]M)/g, '')
    .replace(/ [-–] /g, '–')
    .replace(/ (?=[AP]M)/g, ' ')
    .replace(/–/g, '–​');

const visitText = (min: number | null) => (!min ? 'Check locally' : min < 60 ? `${min} min` : `${Math.round((min / 60) * 10) / 10} hr`);

export default function PlaceScreen() {
  const { id } = useParams();
  const placeId = Number(id) || null;
  const theme = useTheme();
  const p = usePalette();
  const navigate = useNavigate();
  const pos = useCurrentPosition();
  const place = usePlace(placeId, pos.known ? nearParam(pos) : undefined);
  const requireLogin = useRequireLogin();
  const toggleSave = useToggleSave();
  const togglePlan = useTogglePlan();
  const toast = useFlash(2500);

  const d = place.data;
  const saved = !!d?.isSaved;
  const inPlan = !!d?.planStopId;
  const words = (d?.name ?? '').split(' ');
  const deccanSaved = theme === 'deccan';

  const v = {
    back: (e: React.MouseEvent) => {
      if (window.history.length > 1) {
        e.preventDefault();
        navigate(-1);
      }
    },
    kicker: d ? [d.kind && d.category !== 'Heritage' ? d.kind : d.category, d.area].filter(Boolean).join(' · ').toUpperCase() : '',
    name: d?.name ?? (place.isError ? 'Place not found' : ''),
    titleA: words.length > 1 ? words.slice(0, -1).join(' ') : '',
    titleB: words[words.length - 1] ?? '',
    nameMr: d?.nameMr ?? '',
    description: d?.description ?? (place.isError ? 'This place may have been removed. Go back to Explore.' : ''),
    hours: d?.hours ? compactHours(d.hours) : 'Check locally',
    fee: d?.entryFee ?? (d?.free ? 'Free' : 'Check locally'),
    visit: visitText(d?.visitMinutes ?? null),
    stampTop: d?.estYear && /^\d{4}$/.test(d.estYear) ? d.estYear : `+${d?.xp ?? 30}`,
    stampBottom: d?.estYear && /^\d{4}$/.test(d.estYear) ? 'EST.' : 'XP',
    hospitalName: d?.hospital?.name ?? 'Help nearby',
    hospitalKm: d?.hospital?.km !== null && d?.hospital?.km !== undefined ? ` · ${kmText(d.hospital.km)}` : '',
    hospitalLine: d?.hospital ? `${d.hospital.name}${d.hospital.km !== null ? ` · ${kmText(d.hospital.km)}` : ''}` : 'See help on the map',
    helpHref: '/map?layer=help',
    directionsHref: placeId ? `/directions?to=${placeId}` : '/directions',
    googleHref: d ? googlePlaceUrl(d) : '',
    ctaLabel: inPlan ? 'In your plan' : 'Add to plan',
    ctaLabelDeccan: inPlan ? 'In your journey' : 'Add to journey',
    xpLabel: inPlan ? 'View' : `+${d?.xp ?? 30} XP`,
    addToPlan: (e: React.MouseEvent) => {
      if (inPlan || !d) return; // "In your plan" just opens the Plan tab
      e.preventDefault();
      if (!requireLogin()) return;
      togglePlan.mutate(
        { id: d.id, planStopId: null },
        {
          onSuccess: (r) => toast.flash(`Added to ${r.weekday}`),
          onError: (err) => toast.flash(err.message),
        }
      );
    },
    saveLabel: saved ? 'Remove from saved' : 'Save place',
    savePressed: saved ? 'true' : 'false',
    saveBg: saved ? (deccanSaved ? p.surface : p.onInk) : deccanSaved ? 'rgba(255,251,243,0.18)' : 'rgba(246,246,243,0.16)',
    saveFill: saved ? p.primary : 'none',
    saveStroke: saved ? p.primary : deccanSaved ? p.surface : p.onInk,
    showToast: toast.show,
    toastText: toast.text,
    toggleSave: () => {
      if (!d || !requireLogin()) return;
      toggleSave.mutate(
        { id: d.id, isSaved: saved },
        {
          onSuccess: () => toast.flash(!saved ? 'Saved to your places' : 'Removed from saved'),
          onError: (err) => toast.flash(err.message),
        }
      );
    },
  };
  return <Themed classic={PlaceView} deccan={DeccanPlaceView} v={v} />;
}
