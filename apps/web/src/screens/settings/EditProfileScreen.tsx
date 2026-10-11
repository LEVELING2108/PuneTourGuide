import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { usersApi } from '../../api/auth';
import { Themed } from '../../components/Themed';
import { useAccountRequired } from '../../features/account';
import { shrinkPhoto } from '../../lib/image';
import { initials } from '../../lib/text';
import { chipColors, usePalette } from '../../lib/palette';
import { useAuthStore, useUser } from '../../stores/auth';
import EditProfileView from '../../views/classic/EditProfile.view';
import DeccanEditProfileView from '../../views/deccan/DeccanEditProfile.view';

const TASTES = ['Heritage', 'Treks', 'Temples', 'Food', 'Museums', 'Nature'] as const;

export default function EditProfileScreen() {
  const p = usePalette();
  const navigate = useNavigate();
  const user = useUser();
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ name: '', email: '', interests: [] as string[] });
  const [photoOpen, setPhotoOpen] = useState(false);
  const [busy, setBusy] = useState<'save' | 'photo' | null>(null);
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const camera = useRef<HTMLInputElement>(null);
  const gallery = useRef<HTMLInputElement>(null);

  useAccountRequired();

  const loaded = useRef(false);
  useEffect(() => {
    if (user && !loaded.current) {
      loaded.current = true;
      setForm({ name: user.name, email: user.email ?? '', interests: user.interests ?? [] });
    }
  }, [user]);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy('photo');
    setStatus(null);
    try {
      setUser(await usersApi.uploadAvatar(await shrinkPhoto(file)));
      setStatus({ text: 'Photo updated', ok: true });
    } catch (err) {
      setStatus({ text: err instanceof Error ? err.message : 'Could not upload the photo', ok: false });
    } finally {
      setBusy(null);
    }
  };

  const hasPhoto = !!user?.avatarUrl;
  const fileInput = (ref: React.RefObject<HTMLInputElement | null>, capture: boolean) => (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      {...(capture ? { capture: 'user' as const } : {})}
      hidden
      onChange={(e) => {
        void upload(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  const v = {
    name: form.name,
    email: form.email,
    phone: user?.phone ? user.phone.replace(/^\+91(\d{5})(\d{5})$/, '$1 $2') : '',
    onName: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, name: e.target.value }),
    onEmail: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value }),
    tastes: TASTES.map((label) => {
      const sel = form.interests.includes(label);
      return {
        label,
        key: label,
        ...chipColors(p, sel),
        pick: () => setForm({ ...form, interests: sel ? form.interests.filter((x) => x !== label) : [...form.interests, label] }),
      };
    }),
    photoOpen,
    avatarUrl: user?.avatarUrl ?? null,
    avatarBg: hasPhoto ? p.avatarPhoto : p.primary,
    avatarText: hasPhoto ? '' : busy === 'photo' ? '…' : initials(form.name || user?.name),
    avatarSize: '38px',
    avatarTrack: '0',
    openPhoto: () => setPhotoOpen(true),
    closePhoto: () => setPhotoOpen(false),
    takePhoto: () => {
      setPhotoOpen(false);
      camera.current?.click();
    },
    pickGallery: () => {
      setPhotoOpen(false);
      gallery.current?.click();
    },
    removePhoto: async () => {
      setPhotoOpen(false);
      try {
        setUser(await usersApi.removeAvatar());
      } catch (err) {
        setStatus({ text: err instanceof Error ? err.message : 'Could not remove the photo', ok: false });
      }
    },
    fileInputs: (
      <>
        {fileInput(camera, true)}
        {fileInput(gallery, false)}
      </>
    ),
    status: status?.text ?? '',
    statusColor: status?.ok ? p.primary : '#A3281A',
    saving: busy !== null,
    saveLabel: busy === 'save' ? 'Saving…' : 'Save changes',
    save: async () => {
      const name = form.name.trim();
      const email = form.email.trim();
      if (!name) return setStatus({ text: 'Enter your name', ok: false });
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus({ text: 'Enter a valid email', ok: false });
      setBusy('save');
      try {
        setUser(await usersApi.update({ name, email: email || null, interests: form.interests as (typeof TASTES)[number][] }));
        navigate('/profile');
      } catch (err) {
        setStatus({ text: err instanceof Error ? err.message : 'Could not save', ok: false });
      } finally {
        setBusy(null);
      }
    },
  };
  return <Themed classic={EditProfileView} deccan={DeccanEditProfileView} v={v} />;
}
