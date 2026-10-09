import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, usePalette } from '../../lib/palette';
import OnboardView from '../../views/classic/Onboard.view';
import DeccanOnboardView from '../../views/deccan/DeccanOnboard.view';
import { RELATIONS } from './shared';

/** First emergency contact. */
export default function OnboardScreen() {
  const p = usePalette();
  const [rel, setRel] = useState<string>('Parent');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [picked, setPicked] = useState(false);

  const who = name.trim() ? name.trim() : 'THEY';
  const v = {
    rels: RELATIONS.map((label) => ({ label, key: label, ...chipColors(p, label === rel), pick: () => setRel(label) })),
    whoUpper: who.toUpperCase(),
    name,
    phone,
    pickLabel: picked ? 'Picked from contacts · change' : 'Pick from my contacts',
    pickContact: () => {
      setPicked(true);
      setName('Aai');
      setRel('Parent');
      setPhone('98XXX X4521');
    },
    onName: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
  };
  return <Themed classic={OnboardView} deccan={DeccanOnboardView} v={v} />;
}
