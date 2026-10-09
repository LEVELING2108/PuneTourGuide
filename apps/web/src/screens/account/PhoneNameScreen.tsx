import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import PhoneNameView from '../../views/classic/PhoneName.view';
import DeccanPhoneNameView from '../../views/deccan/DeccanPhoneName.view';
import { agreeBox } from './shared';

/** "Almost there": name, optional email and terms for new mobile users. */
export default function PhoneNameScreen() {
  const p = usePalette();
  const [agree, setAgree] = useState(false);
  return <Themed classic={PhoneNameView} deccan={DeccanPhoneNameView} v={agreeBox(p, agree, () => setAgree(!agree))} />;
}
