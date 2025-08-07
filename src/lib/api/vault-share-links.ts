import { supabase } from '@/lib/supabase';

export interface VaultShareLink {
  token: string;
  vault_id: string;
  passcode_hash: string | null;
  encrypted_data: any;
  max_views: number | null;
  views_used: number;
  expires_at: string | null;
  created_at: string;
}

export interface VaultShareLinkWithVault extends VaultShareLink {
  vault: {
    name: string;
    type: string;
  };
}

export interface VaultShareLinkCreateData {
  vault_id: string;
  expires_at?: string;
  max_views?: number;
  passcode?: string;
}

export const vaultShareLinks = {
  // Get all share links for a vault
  async getVaultShareLinks(vaultId: string) {
    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Create new share link
  async createShareLink(linkData: VaultShareLinkCreateData) {
    // Generate secure token
    const token = crypto.randomUUID() + Date.now().toString(36);
    
    // Hash passcode if provided
    let passcodeHash = null;
    if (linkData.passcode) {
      const encoder = new TextEncoder();
      const data = encoder.encode(linkData.passcode);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      passcodeHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Encrypt minimal vault data for sharing
    const encryptedData = {
      vault_id: linkData.vault_id,
      role: 'view' // Share links are always view-only
    };

    const { data, error } = await supabase
      .from('shared_links')
      .insert({
        token,
        vault_id: linkData.vault_id,
        passcode_hash: passcodeHash,
        encrypted_data: encryptedData,
        max_views: linkData.max_views,
        expires_at: linkData.expires_at,
        views_used: 0
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Get share link by token (for accessing)
  async getShareLinkByToken(token: string) {
    const { data, error } = await supabase
      .from('shared_links')
      .select(`
        *,
        vault:vault_id (
          id,
          name,
          type
        )
      `)
      .eq('token', token)
      .single();
    
    return { data, error };
  },

  // Verify share link access
  async verifyShareLinkAccess(token: string, passcode?: string) {
    const { data: link, error } = await this.getShareLinkByToken(token);
    
    if (error || !link) {
      return { valid: false, error: 'Invalid share link' };
    }

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return { valid: false, error: 'Share link has expired' };
    }

    // Check view limit
    if (link.max_views && link.views_used >= link.max_views) {
      return { valid: false, error: 'Share link has reached maximum views' };
    }

    // Check passcode if required
    if (link.passcode_hash && passcode) {
      const encoder = new TextEncoder();
      const data = encoder.encode(passcode);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (inputHash !== link.passcode_hash) {
        return { valid: false, error: 'Invalid passcode' };
      }
    } else if (link.passcode_hash) {
      return { valid: false, error: 'Passcode required' };
    }

    // Increment view count
    await supabase
      .from('shared_links')
      .update({ views_used: link.views_used + 1 })
      .eq('token', token);

    return { valid: true, data: link };
  },

  // Revoke share link
  async revokeShareLink(token: string) {
    const { error } = await supabase
      .from('shared_links')
      .delete()
      .eq('token', token);
    
    return { error };
  },

  // Get vault items via share link
  async getSharedVaultItems(vaultId: string) {
    const { data, error } = await supabase
      .from('vault_items')
      .select('id, title, username, password, notes, tags, created_at')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  }
};