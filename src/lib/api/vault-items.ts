import { supabase } from '@/lib/supabase';

export interface VaultItem {
  id: string;
  vault_id: string;
  title: string;
  username: string | null;
  password: string;
  notes: string | null;
  tags: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface VaultItemCreateData {
  title: string;
  username?: string;
  password: string;
  notes?: string;
  tags?: string[];
}

export interface VaultItemUpdateData {
  title?: string;
  username?: string;
  password?: string;
  notes?: string;
  tags?: string[];
}

export const vaultItems = {
  // Get all items in a vault
  async getVaultItems(vaultId: string) {
    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Get single item
  async getVaultItem(itemId: string) {
    const { data, error } = await supabase
      .from('vault_items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    return { data, error };
  },

  // Create new item
  async createVaultItem(vaultId: string, userId: string, itemData: VaultItemCreateData) {
    const { data, error } = await supabase
      .from('vault_items')
      .insert({
        vault_id: vaultId,
        created_by: userId,
        ...itemData
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Update item
  async updateVaultItem(itemId: string, updates: VaultItemUpdateData) {
    const { data, error } = await supabase
      .from('vault_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete item
  async deleteVaultItem(itemId: string) {
    const { error } = await supabase
      .from('vault_items')
      .delete()
      .eq('id', itemId);
    
    return { error };
  }
};