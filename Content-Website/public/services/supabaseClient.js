import { createClient } from '@supabase/supabase-js';

let supabaseClientCache = null;
let supabaseClientCacheKey = '';

function createSupabaseClient() {
  const config = window.APP_CONFIG || {};
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY || config.SUPABASE_URL.includes('PASTE_')) {
    return null;
  }
  const cacheKey = `${config.SUPABASE_URL}::${config.SUPABASE_ANON_KEY}`;
  if (supabaseClientCache && supabaseClientCacheKey === cacheKey) {
    return supabaseClientCache;
  }
  supabaseClientCache = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  supabaseClientCacheKey = cacheKey;
  return supabaseClientCache;
}

export { createSupabaseClient };
