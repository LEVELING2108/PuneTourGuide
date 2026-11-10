import { Themed } from '../../components/Themed';
import { usePalette } from '../../lib/palette';
import { requestLocation, requestMotion } from '../../features/permissions';
import { markOnboarded } from '../../stores/onboarding';
import { usePermissionStore } from '../../stores/permissions';
import PermissionsView from '../../views/classic/Permissions.view';
import DeccanPermissionsView from '../../views/deccan/DeccanPermissions.view';

const DEFS = [
  { key: 'loc', title: 'Location', why: 'Finds the nearest hospital and police, and sends your exact spot during an SOS.', delay: 'd2' },
  { key: 'motion', title: 'Motion', why: 'Lets a hard shake start the SOS countdown when you can’t reach the screen.', delay: 'd3' },
] as const;

export default function PermissionsScreen() {
  const p = usePalette();
  const { location, motion, setLocation, setMotion } = usePermissionStore();
  const state = { loc: location, motion };

  const perms = DEFS.map((d) => {
    const on = state[d.key];
    return {
      ...d,
      key: d.key,
      isLoc: d.key === 'loc',
      isMotion: d.key === 'motion',
      isNotify: false,
      pending: !on,
      granted: on,
      bd: on ? p.softBd : p.line,
      bg: on ? p.permOnBg : p.surface,
      // Must run inside the tap handler: iOS only shows the prompt for a user gesture
      allow: async () => {
        if (d.key === 'loc') setLocation(await requestLocation());
        else setMotion(await requestMotion());
      },
    };
  });
  const count = [location, motion].filter(Boolean).length;

  return (
    <Themed
      classic={PermissionsView}
      deccan={DeccanPermissionsView}
      v={{ perms, ctaLabel: count === 2 ? 'All set · continue' : 'Continue', done: markOnboarded }}
    />
  );
}
