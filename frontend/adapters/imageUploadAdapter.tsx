// adapters/imageUploadAdapter.tsx

import { fetchHandler } from '../utils/fetchingUtils'; // ✅ Your helper utility
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// utils/imageUploadAdapter.ts

/**
 * Uploads a player image to S3 via backend proxy route.
 * 
 * @param imageUri - Local URI from expo-image-picker
 * @returns imageUrl (public URL stored in S3)
 */
export const uploadPlayerImage = async (imageUri: string): Promise<[string | null, Error | null]> => {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop()!;
    const type = `image/${filename.split('.').pop()}`;

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any); // 👈 avoid TS error: FormData expects `File` in browser, but RN uses `any`

    const res = await fetch(`${API_BASE_URL}/uploads/player-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok || !data.imageUrl) {
      console.error('Upload failed:', data);
      return [null, new Error(isJson ? data.message || 'Image upload failed' : data)];
    }

    return [data.imageUrl, null]; // ✅ return uploaded image URL

  } catch (err) {
    return [null, err as Error];
  }
};
