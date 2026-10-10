import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { medicalApi, type MedicalInput } from '../../api/medical';
import { Themed } from '../../components/Themed';
import { useAccountRequired } from '../../features/account';
import { chipColors, toggleColors, usePalette } from '../../lib/palette';
import { useIsLoggedIn } from '../../stores/auth';
import MedicalView from '../../views/classic/Medical.view';
import DeccanMedicalView from '../../views/deccan/DeccanMedical.view';

/** Shown with a true minus sign; stored as ASCII ("O-"). */
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const show = (g: string) => g.replace('-', '−');

/** Medical info (TECH_DESIGN §9.8): encrypted on the server, read back only by you. */
export default function MedicalScreen() {
  const p = usePalette();
  const loggedIn = useIsLoggedIn();
  const qc = useQueryClient();
  const medicalQ = useQuery({ queryKey: ['medical'], queryFn: medicalApi.get, enabled: loggedIn });
  const [form, setForm] = useState<MedicalInput>({ bloodGroup: null, allergies: '', medicines: '', notes: '', showOnLockScreen: true });
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);

  useAccountRequired();

  useEffect(() => {
    const m = medicalQ.data;
    if (m) setForm({ bloodGroup: m.bloodGroup, allergies: m.allergies, medicines: m.medicines, notes: m.notes, showOnLockScreen: m.showOnLockScreen });
  }, [medicalQ.data]);

  const save = useMutation({
    mutationFn: medicalApi.put,
    onSuccess: (m) => {
      qc.setQueryData(['medical'], m);
      setStatus({ text: 'Saved · encrypted, shared only during an SOS', ok: true });
    },
    onError: (err) => setStatus({ text: err.message, ok: false }),
  });

  const lk = toggleColors(p, form.showOnLockScreen);
  const field = (k: 'allergies' | 'medicines' | 'notes') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(null);
    setForm({ ...form, [k]: e.target.value });
  };

  const v = {
    groups: BLOOD_GROUPS.map((g) => ({
      label: show(g),
      key: g,
      ...chipColors(p, g === form.bloodGroup),
      pick: () => {
        setStatus(null);
        setForm({ ...form, bloodGroup: form.bloodGroup === g ? null : g });
      },
    })),
    allergies: form.allergies,
    medicines: form.medicines,
    notes: form.notes,
    onAllergies: field('allergies'),
    onMedicines: field('medicines'),
    onNotes: field('notes'),
    lockPressed: lk.pressed,
    lockTrack: lk.track,
    lockKnob: lk.knob,
    lockText: form.showOnLockScreen ? 'Contacts get allergies and medicines in an SOS; blood group always' : 'Only your blood group goes to contacts in an SOS',
    toggleLock: () => {
      setStatus(null);
      setForm({ ...form, showOnLockScreen: !form.showOnLockScreen });
    },
    status: status?.text ?? '',
    statusColor: status?.ok ? p.primary : '#A3281A',
    saving: save.isPending,
    saveLabel: save.isPending ? 'Saving…' : 'Save',
    save: () => save.mutate(form),
  };
  return <Themed classic={MedicalView} deccan={DeccanMedicalView} v={v} />;
}
