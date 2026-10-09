import { useState } from 'react';
import { Themed } from '../../components/Themed';
import ForgotPasswordView from '../../views/classic/ForgotPassword.view';
import DeccanForgotPasswordView from '../../views/deccan/DeccanForgotPassword.view';

export default function ForgotPasswordScreen() {
  const [sent, setSent] = useState(false);
  const v = { sent, notSent: !sent, send: () => setSent(true), again: () => setSent(false) };
  return <Themed classic={ForgotPasswordView} deccan={DeccanForgotPasswordView} v={v} />;
}
