import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { vaultShareLinks, VaultShareLink, VaultShareLinkCreateData } from '@/lib/api/vault-share-links';

export function useVaultShareLinks(vaultId: string) {
  const [shareLinks, setShareLinks] = useState<VaultShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadShareLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await vaultShareLinks.getVaultShareLinks(vaultId);
      if (error) {
        toast({
          title: 'Failed to load share links',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setShareLinks(data || []);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load share links',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createShareLink = async (data: VaultShareLinkCreateData) => {
    try {
      const { data: shareLink, error } = await vaultShareLinks.createShareLink(data);
      if (error) {
        toast({
          title: 'Failed to create share link',
          description: error.message,
          variant: 'destructive'
        });
        return { success: false, error };
      } else {
        toast({
          title: 'Share link created',
          description: 'The share link has been created successfully'
        });
        await loadShareLinks();
        return { success: true, data: shareLink };
      }
    } catch (error: any) {
      toast({
        title: 'Failed to create share link',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const revokeShareLink = async (token: string) => {
    try {
      const { error } = await vaultShareLinks.revokeShareLink(token);
      if (error) {
        toast({
          title: 'Failed to revoke share link',
          description: error.message,
          variant: 'destructive'
        });
        return { success: false, error };
      } else {
        toast({
          title: 'Share link revoked',
          description: 'The share link has been revoked'
        });
        await loadShareLinks();
        return { success: true };
      }
    } catch (error: any) {
      toast({
        title: 'Failed to revoke share link',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  useEffect(() => {
    if (vaultId) {
      loadShareLinks();
    }
  }, [vaultId]);

  return {
    shareLinks,
    loading,
    createShareLink,
    revokeShareLink,
    refreshShareLinks: loadShareLinks
  };
}