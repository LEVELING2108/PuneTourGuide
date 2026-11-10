/**
 * Shrink a photo on the phone before upload: upright per EXIF, longest side ≤ 1024 px, JPEG.
 * Phone photos are often 5–12 MB; this keeps uploads small on mobile data. The server
 * re-encodes again and strips all metadata.
 */
export async function shrinkPhoto(file: File, max = 1024): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo');
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Formats the browser cannot decode (some HEIC): let the server try
    if (file.size > 5 * 1024 * 1024) throw new Error('This photo is too large. Choose one under 5 MB.');
    return file;
  }
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not read this photo'))), 'image/jpeg', 0.85));
}
