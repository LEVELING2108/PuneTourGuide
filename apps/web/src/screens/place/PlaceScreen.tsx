import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import { useFlash } from '../../lib/useFlash';
import PlaceView from '../../views/classic/Place.view';
import DeccanPlaceView from '../../views/deccan/DeccanPlace.view';

export default function PlaceScreen() {
  const p = usePalette();
  const [saved, setSaved] = useState(false);
  const toast = useFlash(2500);

  const v = {
    saved,
    saveLabel: saved ? 'Remove from saved' : 'Save place',
    savePressed: saved ? 'true' : 'false',
    saveBg: saved ? p.onInk : 'rgba(246,246,243,0.16)',
    saveFill: saved ? p.primary : 'none',
    saveStroke: saved ? p.primary : p.onInk,
    showToast: toast.show,
    toastKey: toast.key,
    toastText: toast.text,
    toggleSave: () => {
      setSaved(!saved);
      toast.flash(!saved ? 'Saved to your places' : 'Removed from saved');
    },
  };
  return <Themed classic={PlaceView} deccan={DeccanPlaceView} v={v} />;
}
