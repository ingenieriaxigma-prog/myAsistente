import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

// Prefer environment variables; fall back to generated defaults to avoid breaking existing behavior.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabaseClient() {
  return supabase;
}
