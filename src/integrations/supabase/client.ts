import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Supabase client initialisation.  Reads the URL and publishable key
// from Vite environment variables.  The client is strongly typed
// against the Database interface defined in `src/types/supabase.ts`.
const SUPABASE_URL: string = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Supabase env variables missing');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
  },
});
