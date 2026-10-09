import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, toggleColors, usePalette } from '../../lib/palette';
import ContactEditView from '../../views/classic/ContactEdit.view';
import DeccanContactEditView from '../../views/deccan/DeccanContactEdit.view';
import { RELATIONS } from '../account/shared';

type Props = { mode: 'add' | 'edit' };

/** Edit an emergency contact; ContactAdd is the same screen in "add" mode. */
export default function ContactEditScreen({ mode }: Props) {
  const p = usePalette();
  const add = mode === 'add';
  const [s, setS] = useState(
    add
      ? { name: '', rel: 'Friend', phone: '', primary: false, confirm: false, picked: false }
      : { name: 'Aai', rel: 'Parent', phone: '98XXX X4521', primary: true, confirm: false, picked: false }
  );
  const primary = toggleColors(p, s.primary);

  const v = {
    rels: RELATIONS.map((label) => ({ label, key: label, ...chipColors(p, label === s.rel), pick: () => setS({ ...s, rel: label }) })),
    isAdd: add,
    title: add ? 'Add contact' : 'Edit contact',
    ctaLabel: add ? 'Add contact' : 'Save changes',
    showAvatar: !add || s.picked,
    initial: (s.name || '?').charAt(0).toUpperCase(),
    pickLabel: s.picked ? 'Picked from contacts · change' : 'Pick from phone contacts',
    pickContact: () => setS({ ...s, picked: true, name: 'Didi', rel: 'Sibling', phone: '97XXX X3306' }),
    name: s.name,
    phone: s.phone,
    onName: (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, name: e.target.value }),
    primaryPressed: primary.pressed,
    primaryTrack: primary.track,
    primaryKnob: primary.knob,
    togglePrimary: () => setS({ ...s, primary: !s.primary }),
    canRemove: !add,
    confirming: s.confirm,
    notConfirming: !s.confirm,
    askRemove: () => setS({ ...s, confirm: true }),
    cancelRemove: () => setS({ ...s, confirm: false }),
  };
  return <Themed classic={ContactEditView} deccan={DeccanContactEditView} v={v} />;
}
