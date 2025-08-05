import { supabase } from '@/lib/supabase';

export interface Vault {
  id: string;
  name: string;
  type: 'personal' | 'family' | 'team';
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface VaultWithMembers extends Vault {
  member_count: number;
  user_role: string;
}

export interface VaultCreateData {
  name: string;
  type: 'personal' | 'family' | 'team';
}

export const vaults = {
  // Get all vaults for current user
  async getUserVaults(userId: string) {
    const { data, error } = await supabase.rpc('get_user_vaults', {
      p_user_id: userId
    });
    
    return { data, error };
  },

  // Create new vault
  async createVault(userId: string, vaultData: VaultCreateData) {
    const { data, error } = await supabase
      .from('vaults')
      .insert({
        ...vaultData,
        owner_id: userId
      })
      .select()
      .single();

    // If vault is created successfully and it's not personal, add owner as member
    if (data && !error && vaultData.type !== 'personal') {
      await supabase
        .from('vault_members')
        .insert({
          vault_id: data.id,
          user_id: userId,
          role: 'owner'
        });
    }
    
    return { data, error };
  },

  // Get vault by ID
  async getVault(vaultId: string) {
    const { data, error } = await supabase
      .from('vaults')
      .select('*')
      .eq('id', vaultId)
      .single();
    
    return { data, error };
  },

  // Update vault
  async updateVault(vaultId: string, updates: Partial<VaultCreateData>) {
    const { data, error } = await supabase
      .from('vaults')
      .update(updates)
      .eq('id', vaultId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete vault
  async deleteVault(vaultId: string) {
    const { error } = await supabase
      .from('vaults')
      .delete()
      .eq('id', vaultId);
    
    return { error };
  }
};