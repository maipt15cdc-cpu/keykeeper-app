import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { vaultInvitations, VaultInvitation, VaultInvitationCreateData } from '@/lib/api/vault-invitations';

export function useVaultInvitations(vaultId: string) {
  const [invitations, setInvitations] = useState<VaultInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const { data, error } = await vaultInvitations.getVaultInvitations(vaultId);
      if (error) {
        toast({
          title: 'Failed to load invitations',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setInvitations((data || []) as VaultInvitation[]);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load invitations',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createInvitation = async (data: VaultInvitationCreateData) => {
    try {
      const { data: invitation, error } = await vaultInvitations.createInvitation(data);
      if (error) {
        toast({
          title: 'Failed to send invitation',
          description: error.message,
          variant: 'destructive'
        });
        return { success: false, error };
      } else {
        toast({
          title: 'Invitation sent',
          description: `Invitation sent to ${data.email}`
        });
        await loadInvitations();
        return { success: true, data: invitation };
      }
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await vaultInvitations.revokeInvitation(invitationId);
      if (error) {
        toast({
          title: 'Failed to revoke invitation',
          description: error.message,
          variant: 'destructive'
        });
        return { success: false, error };
      } else {
        toast({
          title: 'Invitation revoked',
          description: 'The invitation has been revoked'
        });
        await loadInvitations();
        return { success: true };
      }
    } catch (error: any) {
      toast({
        title: 'Failed to revoke invitation',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (vaultId) {
      loadInvitations();
    }
  }, [vaultId]);

  return {
    invitations,
    loading,
    createInvitation,
    revokeInvitation,
    refreshInvitations: loadInvitations
  };
}