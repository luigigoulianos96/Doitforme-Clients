import { createClient } from '@supabase/supabase-js';

// Builds a browser Supabase client from APP_CONFIG when keys exist.
// Backend integration: replace APP_CONFIG values in /public/config.js before first request.
export const create_supabase_client = () => {
  const config = window.APP_CONFIG || {};
  const hasKeys = Boolean(config.SUPABASE_URL) && Boolean(config.SUPABASE_ANON_KEY);
  const hasPlaceholders = `${config.SUPABASE_URL || ''}`.includes('PASTE_');
  const shouldReturnNull = !hasKeys || hasPlaceholders;

  return shouldReturnNull ? null : createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
};

// Resolves the storage bucket name used for media upload/delete.
// Backend integration: use the same bucket name in Supabase Storage and policies.
export const resolve_storage_bucket = () => {
  const config = window.APP_CONFIG || {};
  return config.STORAGE_BUCKET || 'post-photos';
};
