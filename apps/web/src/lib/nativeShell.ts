export { isNative } from './native';

/** Android app only: the hardware back button walks back through screens, then leaves the app open in the background. */
export function startNativeShell() {
  void import('@capacitor/app').then(({ App }) =>
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      // Minimise rather than exit, so a running SOS or live-location share keeps going
      else void App.minimizeApp();
    })
  );
}
