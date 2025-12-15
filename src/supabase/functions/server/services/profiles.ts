/**
 * PROFILES SERVICE
 * Gestiona perfiles de usuario en la base de datos
 */

import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  specialty: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Get profile by user ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Create a new profile
 */
export async function createProfile(profile: {
  id: string;
  email: string;
  name?: string;
  specialty?: string;
}): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: profile.id,
      email: profile.email,
      name: profile.name || null,
      specialty: profile.specialty || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }

  return data;
}

/**
 * Update profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'name' | 'specialty' | 'avatar_url'>>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }

  return data;
}

/**
 * Delete profile (cascade deletes related data)
 */
export async function deleteProfile(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting profile:', error);
    return false;
  }

  return true;
}
