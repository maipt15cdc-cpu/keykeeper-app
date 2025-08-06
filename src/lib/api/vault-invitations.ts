import { supabase } from '@/lib/supabase';

export interface VaultInvitation {
  id: string;
  vault_id: string;
  email: string;
  role: 'edit' | 'view';
  token: string;
  accepted: boolean;
  expires_at: string;
  created_at: string;
}

export interface VaultInvitationWithVault extends VaultInvitation {
  vault: {
    name: string;
    type: string;
  };
}

export interface VaultInvitationCreateData {
  email: string;
  role: 'edit' | 'view';
  vault_id: string;
}

export const vaultInvitations = {
  // Get all invitations for a vault
  async getVaultInvitations(vaultId: string) {
    const { data, error } = await supabase
      .from('vault_invitations')
      .select('*')
      .eq('vault_id', vaultId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  },

  // Create new invitation
  async createInvitation(invitationData: VaultInvitationCreateData) {
    // Generate secure token
    const token = crypto.randomUUID() + Date.now().toString(36);
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error } = await supabase
      .from('vault_invitations')
      .insert({
        ...invitationData,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    return { data, error };
  },

  // Get invitation by token (for accepting)
  async getInvitationByToken(token: string) {
    const { data, error } = await supabase
      .from('vault_invitations')
      .select(`
        *,
        vault:vault_id (
          name,
          type
        )
      `)
      .eq('token', token)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    
    return { data, error };
  },

  // Accept invitation
  async acceptInvitation(token: string, userId: string) {
    // First get the invitation
    const { data: invitation, error: inviteError } = await this.getInvitationByToken(token);
    
    if (inviteError || !invitation) {
      return { data: null, error: inviteError || new Error('Invalid invitation') };
    }

    // Add user as vault member
    const { error: memberError } = await supabase
      .from('vault_members')
      .upsert({
        vault_id: invitation.vault_id,
        user_id: userId,
        role: invitation.role
      }, {
        onConflict: 'vault_id,user_id'
      });

    if (memberError) {
      return { data: null, error: memberError };
    }

    // Mark invitation as accepted
    const { data, error } = await supabase
      .from('vault_invitations')
      .update({ accepted: true })
      .eq('token', token)
      .select()
      .single();
    
    return { data, error };
  },

  // Revoke invitation
  async revokeInvitation(invitationId: string) {
    const { error } = await supabase
      .from('vault_invitations')
      .delete()
      .eq('id', invitationId);
    
    return { error };
  },

  // Get user's pending invitations
  async getUserInvitations(email: string) {
    const { data, error } = await supabase
      .from('vault_invitations')
      .select(`
        *,
        vault:vault_id (
          name,
          type
        )
      `)
      .eq('email', email)
      .eq('accepted', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    return { data, error };
  }
};