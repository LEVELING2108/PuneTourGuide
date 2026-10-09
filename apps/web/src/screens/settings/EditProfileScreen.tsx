import { useState } from 'react';
import { Themed } from '../../components/Themed';
import { chipColors, usePalette } from '../../lib/palette';
import EditProfileView from '../../views/classic/EditProfile.view';
import DeccanEditProfileView from '../../views/deccan/DeccanEditProfile.view';

const TASTES = ['Heritage', 'Treks', 'Temples', 'Food', 'Museums', 'Nature'];

export default function EditProfileScreen() {
  const p = usePalette();
  const [on, setOn] = useState<Record<string, boolean>>({ Heritage: true, Treks: true, Food: true });
  const [photoOpen, setPhotoOpen] = useState(false);
  const [hasPhoto, setHasPhoto] = useState(false);

  const v = {
    tastes: TASTES.map((label) => {
      const sel = !!on[label];
      return { label, key: label, ...chipColors(p, sel), pick: () => setOn({ ...on, [label]: !sel }) };
    }),
    photoOpen,
    avatarBg: hasPhoto ? p.avatarPhoto : p.primary,
    avatarText: hasPhoto ? 'PHOTO' : 'SS',
    avatarSize: hasPhoto ? '12px' : '38px',
    avatarTrack: hasPhoto ? '0.16em' : '0',
    openPhoto: () => setPhotoOpen(true),
    closePhoto: () => setPhotoOpen(false),
    takePhoto: () => {
      setPhotoOpen(false);
      setHasPhoto(true);
    },
    pickGallery: () => {
      setPhotoOpen(false);
      setHasPhoto(true);
    },
    removePhoto: () => {
      setPhotoOpen(false);
      setHasPhoto(false);
    },
  };
  return <Themed classic={EditProfileView} deccan={DeccanEditProfileView} v={v} />;
}
