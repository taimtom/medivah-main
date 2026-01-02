import { createClient } from '@supabase/supabase-js';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export const supabase = createClient(
  CONFIG.supabase.url,
  CONFIG.supabase.key
);

// ----------------------------------------------------------------------

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data;
}

/**
 * Get public URL for file
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Create signed URL for private files
 */
export async function createSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}


