import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { googlePhotoUrl, type Spot } from '../../api/google';
import { photoCredit, ratingText, useGoogleNearby, useGooglePlace } from '../../features/googlePlaces';
import { useConfirm } from '../../components/Confirm';
import { useDayPicker } from '../../components/DayPicker';
import { Themed } from '../../components/Themed';
import { nearParam, useCurrentPosition } from '../../features/location';
import { kmText, placeTone, shortKmText, travelText, useMarkVisited, useNearby, usePlace, useRequireLogin, useTogglePlan, useToggleSave } from '../../features/places';
import type { PlaceSummary } from '../../api/places';
import type { NearbyCard } from '../../components/NearbyPlaces';
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
  const picker = useDayPicker();
  const confirm = useConfirm();
  const markVisited = useMarkVisited();
  const toast = useFlash(2500);
  const nearby = useNearby(placeId);
  // Live Google Maps extras: photo, rating, open now, side quests and food (absent when off, capped or offline)
  const google = useGooglePlace(placeId);
  const gNearby = useGoogleNearby(placeId);
  const [heroFailed, setHeroFailed] = useState<string | null>(null);

  const d = place.data;
  const saved = !!d?.isSaved;
  const inPlan = !!d?.planStopId;
  const words = (d?.name ?? '').split(' ');
  const deccanSaved = theme === 'deccan';

  const card = (x: PlaceSummary): NearbyCard => {
    const added = x.planStopId !== null;
    return {
      key: x.id,
      name: x.name,
      label: x.kind && x.category !== 'Heritage' ? x.kind : x.category,
      tone: placeTone(x.category, theme),
      distance: x.km !== null ? `${shortKmText(x.km)} away` : '',
      travel: x.km !== null ? travelText(x.km) : '',
      status: x.openNow === null ? null : x.openNow ? 'Open now' : 'Closed now',
      closed: x.openNow === false,
      href: `/place/${x.id}`,
      added,
      addLabel: added ? `Remove ${x.name} from plan` : `Add ${x.name} to plan`,
      toggle: async () => {
        if (!requireLogin()) return;
        const dayId = added ? undefined : await picker.ask(theme === 'deccan' ? 'Add to which day of your journey?' : 'Add to which day?', x.name);
        if (dayId === null) return;
        togglePlan.mutate(
          { id: x.id, planStopId: x.planStopId, dayId },
          {
            onSuccess: (r) => toast.flash(r.added ? `Added to ${r.dayText}` : 'Removed from your plan'),
            onError: (err) => toast.flash(err.message),
          }
        );
      },
    };
  };

  const g = google.data?.available ? google.data : null;
  const gn = gNearby.data?.available ? gNearby.data : null;
  const heroPhoto = g?.photo ? googlePhotoUrl(g.photo, 860) : null;
  const liveStatus = g?.openNow === true ? 'Open now' : g?.openNow === false ? 'Closed now' : null;

  const spotCard = (x: Spot): NearbyCard => ({
    key: x.googleId,
    name: x.name,
    label: x.type ?? 'Place',
    tone: 'var(--primary)',
    distance: x.km !== null ? `${shortKmText(x.km)} away` : '',
    travel: x.km !== null ? travelText(x.km) : '',
    status: x.openNow === null ? null : x.openNow ? 'Open now' : 'Closed now',
    closed: x.openNow === false,
    href: `/spot/${encodeURIComponent(x.googleId)}`,
    photoUrl: x.photo ? googlePhotoUrl(x.photo, 336) : null,
    rating: ratingText(x.rating, x.ratingCount),
    done: !!x.visitedAt,
  });

  const visitedOn = d?.visitedAt ? new Date(d.visitedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  const v = {
    visited: !!visitedOn,
    notVisited: !!d && !visitedOn,
    visitedText: visitedOn ? `Stamp collected ${visitedOn}` : '',
    visitTitle: 'Been here?',
    visitText: markVisited.isPending ? 'Saving…' : `Mark as visited · +${d?.xp ?? 30} XP`,
    markVisited: async () => {
      if (!d || markVisited.isPending || !requireLogin()) return;
      const yes = await confirm.ask({
        title: `Did you visit ${d.name}?`,
        detail: `You collect its stamp and +${d.xp} XP once. It's ticked in your plan too.`,
        confirm: 'Yes, I visited',
      });
      if (!yes) return;
      markVisited.mutate(d.id, {
        onSuccess: (r) => toast.flash(r.stampCollected ? `Stamp collected · +${r.xpAwarded} XP` : 'Already in your passport'),
        onError: (err) => toast.flash(err.message),
      });
    },
    heroPhoto: heroPhoto && heroFailed !== heroPhoto ? heroPhoto : null,
    // Once Google has answered (or failed) and there's still no photo to show
    heroNote: !google.isPending && !(heroPhoto && heroFailed !== heroPhoto) ? 'Photo not available right now' : null,
    heroPhotoFailed: () => setHeroFailed(heroPhoto),
    heroCredit: heroPhoto && heroFailed !== heroPhoto ? photoCredit(g?.photo ?? null) : null,
    ratingLine: g ? [ratingText(g.rating, g.ratingCount), liveStatus].filter(Boolean).join(' · ') || null : null,
    nearbySections: [
      { key: 'places', title: 'Also nearby', items: (nearby.data?.places ?? []).map(card) },
      // Google's food row replaces ours when it's available (ours has only a handful of places)
      ...(gn?.food.length ? [] : [{ key: 'food', title: 'Food nearby', items: (nearby.data?.food ?? []).map(card) }]),
    ],
    googleSections: gn
      ? [
          { key: 'quests', title: 'Side quests', items: gn.sideQuests.map(spotCard) },
          { key: 'gfood', title: 'Food nearby', items: gn.food.map(spotCard) },
        ]
      : [],
    googleLoading: gNearby.isLoading,
    nearbyLoading: nearby.isLoading,
    nearbyEmpty: nearby.isSuccess ? 'No other places close by.' : null,
    nearbyMapHref: d?.lat != null && d?.lng != null ? `/map?layer=places&at=${d.lat.toFixed(4)},${d.lng.toFixed(4)}` : '/map?layer=places',
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
    googleHref: g?.mapsUri ?? (d ? googlePlaceUrl(d) : ''),
    ctaLabel: inPlan ? 'In your plan' : 'Add to plan',
    ctaLabelDeccan: inPlan ? 'In your journey' : 'Add to journey',
    // XP comes once per place: no promise of it after the stamp is collected
    xpLabel: inPlan ? 'View' : visitedOn ? '' : `+${d?.xp ?? 30} XP`,
    addToPlan: async (e: React.MouseEvent) => {
      if (inPlan || !d) return; // "In your plan" just opens the Plan tab
      e.preventDefault();
      if (!requireLogin()) return;
      const dayId = await picker.ask(theme === 'deccan' ? 'Add to which day of your journey?' : 'Add to which day?', d.name);
      if (dayId === null) return;
      togglePlan.mutate(
        { id: d.id, planStopId: null, dayId },
        {
          onSuccess: (r) => toast.flash(`Added to ${r.dayText}`),
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
  return (
    <>
      <Themed classic={PlaceView} deccan={DeccanPlaceView} v={v} />
      {picker.sheet}
      {confirm.sheet}
    </>
  );
}
