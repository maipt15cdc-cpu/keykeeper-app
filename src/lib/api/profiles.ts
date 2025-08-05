import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  gender: string | null;
  company: string | null;
  purpose: string | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileCreateData {
  first_name: string;
  last_name: string;
  phone_number?: string;
  gender?: string;
  company?: string;
  purpose?: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: string;
  company?: string;
  purpose?: string;
}

export const profiles = {
  // Get current user's profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    return { data, error };
  },

  // Create or update profile (upsert)
  async createProfile(userId: string, profileData: ProfileCreateData) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...profileData
      }, { 
        onConflict: 'user_id'
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Update profile
  async updateProfile(userId: string, profileData: ProfileUpdateData) {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  }
};