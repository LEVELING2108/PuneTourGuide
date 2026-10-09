import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Themed } from '../../components/Themed';
import { isOnboarded } from '../../stores/onboarding';
import SplashView from '../../views/classic/Splash.view';
import DeccanSplashView from '../../views/deccan/DeccanSplash.view';

/** Splash: tap or wait 2 s → Intro on first launch, Home after that. */
export default function SplashScreen() {
  const navigate = useNavigate();
  const go = useCallback(() => navigate(isOnboarded() ? '/' : '/intro', { replace: true }), [navigate]);

  useEffect(() => {
    const t = window.setTimeout(go, 2000);
    return () => window.clearTimeout(t);
  }, [go]);

  return <Themed classic={SplashView} deccan={DeccanSplashView} v={{ go }} />;
}
