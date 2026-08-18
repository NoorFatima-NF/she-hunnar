import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Automatically strip trailing /rest/v1/ or slashes if user pasted full REST endpoint
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  cleanUrl && 
  supabaseAnonKey && 
  cleanUrl !== 'https://your-project.supabase.co' &&
  !cleanUrl.includes('your-project')
);

if (!isSupabaseConfigured) {
  console.info(
    '[Supabase] Supabase credentials not found or placeholder in .env. Running with local storage & mock database fallback.'
  );
} else {
  console.log('⚡ [Supabase] Initialized with endpoint:', cleanUrl);
}

export const supabase = createClient(
  cleanUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);

