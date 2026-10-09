import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router';
import { isOnboarded } from '../stores/onboarding';
import HomeScreen from '../screens/home/HomeScreen';
import SosScreen from '../screens/sos/SosScreen';

// SOS and Home are eager (must open instantly, also offline); the rest load on demand.
const SplashScreen = lazy(() => import('../screens/onboarding/SplashScreen'));
const IntroScreen = lazy(() => import('../screens/onboarding/IntroScreen'));
const PermissionsScreen = lazy(() => import('../screens/onboarding/PermissionsScreen'));
const LoginScreen = lazy(() => import('../screens/account/LoginScreen'));
const SignUpScreen = lazy(() => import('../screens/account/SignUpScreen'));
const OtpScreen = lazy(() => import('../screens/account/OtpScreen'));
const PhoneNameScreen = lazy(() => import('../screens/account/PhoneNameScreen'));
const OnboardScreen = lazy(() => import('../screens/account/OnboardScreen'));
const ForgotPasswordScreen = lazy(() => import('../screens/account/ForgotPasswordScreen'));
const ExploreScreen = lazy(() => import('../screens/explore/ExploreScreen'));
const FiltersScreen = lazy(() => import('../screens/explore/FiltersScreen'));
const MapScreen = lazy(() => import('../screens/map/MapScreen'));
const NavigationScreen = lazy(() => import('../screens/map/NavigationScreen'));
const PlanScreen = lazy(() => import('../screens/plan/PlanScreen'));
const PlaceScreen = lazy(() => import('../screens/place/PlaceScreen'));
const ProfileTabScreen = lazy(() => import('../screens/settings/ProfileTabScreen'));
const SettingsScreen = lazy(() => import('../screens/settings/SettingsScreen'));
const EditProfileScreen = lazy(() => import('../screens/settings/EditProfileScreen'));
const ContactsScreen = lazy(() => import('../screens/settings/ContactsScreen'));
const ContactEditScreen = lazy(() => import('../screens/settings/ContactEditScreen'));
const MedicalScreen = lazy(() => import('../screens/settings/MedicalScreen'));
const OfflineScreen = lazy(() => import('../screens/settings/OfflineScreen'));
const LanguageScreen = lazy(() => import('../screens/settings/LanguageScreen'));
const ThemeScreen = lazy(() => import('../screens/settings/ThemeScreen'));
const SignOutScreen = lazy(() => import('../screens/settings/SignOutScreen'));

let launched = false;

/** App frame + first-launch redirect (Splash → Intro on first launch). */
function RootLayout() {
  const location = useLocation();
  const firstHit = !launched;
  launched = true;
  if (firstHit && location.pathname === '/' && !isOnboarded()) {
    return <Navigate to="/welcome" replace />;
  }
  return (
    <div className="app-frame">
      <Suspense fallback={<div className="scr" style={{ height: '100%', background: 'var(--bg)' }} />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomeScreen /> },
      { path: '/welcome', element: <SplashScreen /> },
      { path: '/intro', element: <IntroScreen /> },
      { path: '/permissions', element: <PermissionsScreen /> },
      { path: '/login', element: <LoginScreen /> },
      { path: '/signup', element: <SignUpScreen /> },
      { path: '/otp', element: <OtpScreen /> },
      { path: '/almost-there', element: <PhoneNameScreen /> },
      { path: '/first-contact', element: <OnboardScreen /> },
      { path: '/forgot', element: <ForgotPasswordScreen /> },
      { path: '/explore', element: <ExploreScreen /> },
      { path: '/explore/filters', element: <FiltersScreen /> },
      { path: '/map', element: <MapScreen /> },
      { path: '/directions/:stopId?', element: <NavigationScreen /> },
      { path: '/plan', element: <PlanScreen /> },
      { path: '/place/:id?', element: <PlaceScreen /> },
      { path: '/sos', element: <SosScreen /> },
      { path: '/profile', element: <ProfileTabScreen /> },
      { path: '/settings', element: <SettingsScreen /> },
      { path: '/settings/profile', element: <EditProfileScreen /> },
      { path: '/settings/contacts', element: <ContactsScreen /> },
      { path: '/settings/contacts/new', element: <ContactEditScreen mode="add" /> },
      { path: '/settings/contacts/:id', element: <ContactEditScreen mode="edit" /> },
      { path: '/settings/medical', element: <MedicalScreen /> },
      { path: '/settings/offline', element: <OfflineScreen /> },
      { path: '/settings/language', element: <LanguageScreen /> },
      { path: '/settings/theme', element: <ThemeScreen /> },
      { path: '/settings/sign-out', element: <SignOutScreen /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
