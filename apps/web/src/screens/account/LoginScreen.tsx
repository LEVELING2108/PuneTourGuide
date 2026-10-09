import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import LoginView from '../../views/classic/Login.view';
import DeccanLoginView from '../../views/deccan/DeccanLogin.view';
import { modeTabs } from './shared';

export default function LoginScreen() {
  const p = usePalette();
  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [show, setShow] = useState(false);

  const v = {
    ...modeTabs(p, mode, setMode),
    pwType: show ? 'text' : 'password',
    hidden: !show,
    shown: show,
    showLabel: show ? 'Hide password' : 'Show password',
    toggleShow: (e?: React.MouseEvent) => {
      e?.preventDefault();
      setShow(!show);
    },
  };
  return <Themed classic={LoginView} deccan={DeccanLoginView} v={v} />;
}
