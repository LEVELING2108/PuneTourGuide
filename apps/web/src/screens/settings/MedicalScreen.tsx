import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, toggleColors, usePalette } from '../../lib/palette';
import MedicalView from '../../views/classic/Medical.view';
import DeccanMedicalView from '../../views/deccan/DeccanMedical.view';

const BLOOD_GROUPS = ['A+', 'A−', 'B+', 'B−', 'O+', 'O−', 'AB+', 'AB−'];

export default function MedicalScreen() {
  const p = usePalette();
  const [group, setGroup] = useState('O+');
  const [lock, setLock] = useState(true);
  const lk = toggleColors(p, lock);

  const v = {
    groups: BLOOD_GROUPS.map((label) => ({ label, key: label, ...chipColors(p, label === group), pick: () => setGroup(label) })),
    lockPressed: lk.pressed,
    lockTrack: lk.track,
    lockKnob: lk.knob,
    toggleLock: () => setLock(!lock),
  };
  return <Themed classic={MedicalView} deccan={DeccanMedicalView} v={v} />;
}
