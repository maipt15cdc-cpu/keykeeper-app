import { supabase } from '@/lib/supabase';

export interface VaultMember {
  vault_id: string;
  user_id: string;
  role: 'owner' | 'edit' | 'view';
  joined_at: string;
}

export interface VaultMemberWithProfile extends VaultMember {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
}

export const vaultMembers = {
  // Get all members of a vault
  async getVaultMembers(vaultId: string) {
    const { data, error } = await supabase
      .from('vault_members')
      .select(`
        *,
        profiles:user_id (
          first_name,
          last_name,
          email
        )
      `)
      .eq('vault_id', vaultId)
      .order('joined_at', { ascending: true });
    
    return { data, error };
  },

  // Get user's role in a vault
  async getUserRole(vaultId: string, userId: string) {
    const { data, error } = await supabase
      .from('vault_members')
      .select('role')
      .eq('vault_id', vaultId)
      .eq('user_id', userId)
      .maybeSingle();
    
    return { data, error };
  },

  // Add member to vault
  async addMember(vaultId: string, userId: string, role: 'edit' | 'view') {
    const { data, error } = await supabase
      .from('vault_members')
      .insert({
        vault_id: vaultId,
        user_id: userId,
        role
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Update member role
  async updateMemberRole(vaultId: string, userId: string, role: 'edit' | 'view') {
    const { data, error } = await supabase
      .from('vault_members')
      .update({ role })
      .eq('vault_id', vaultId)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  },

  // Remove member from vault
  async removeMember(vaultId: string, userId: string) {
    const { error } = await supabase
      .from('vault_members')
      .delete()
      .eq('vault_id', vaultId)
      .eq('user_id', userId);
    
    return { error };
  }
};