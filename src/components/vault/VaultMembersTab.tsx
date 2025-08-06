import { useState, useEffect } from 'react';
import { Users, Crown, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { vaultMembers } from '@/lib/api/vault-members';
import { vaults } from '@/lib/api/vaults';

interface VaultMembersTabProps {
  vaultId: string;
  canManage: boolean;
  currentUserId?: string;
}

export function VaultMembersTab({ vaultId, canManage, currentUserId }: VaultMembersTabProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [vault, setVault] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [vaultId]);

  const loadData = async () => {
    try {
      // Load vault info and members in parallel
      const [vaultResponse, membersResponse] = await Promise.all([
        vaults.getVault(vaultId),
        vaultMembers.getVaultMembers(vaultId)
      ]);

      if (vaultResponse.error) {
        toast({
          title: 'Failed to load vault',
          description: vaultResponse.error.message,
          variant: 'destructive'
        });
      } else {
        setVault(vaultResponse.data);
      }

      if (membersResponse.error) {
        toast({
          title: 'Failed to load members',
          description: membersResponse.error.message,
          variant: 'destructive'
        });
      } else {
        setMembers(membersResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Failed to load data',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await vaultMembers.removeMember(vaultId, userId);
      
      if (error) {
        toast({
          title: 'Failed to remove member',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Member removed',
          description: 'Member has been removed from the vault'
        });
        loadData(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast({
        title: 'Failed to remove member',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div>Loading members...</div>;
  }

  // Get all members including the owner
  const allMembers = [];
  
  // Add owner as a member
  if (vault) {
    allMembers.push({
      user_id: vault.owner_id,
      role: 'owner',
      joined_at: vault.created_at,
      profiles: null // Will need to fetch this separately if needed
    });
  }
  
  // Add regular members
  allMembers.push(...members);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vault Members</h3>
      {allMembers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No members found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {allMembers.map((member: any) => (
            <Card key={member.user_id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {member.role === 'owner' && (
                      <Crown className="h-4 w-4 text-yellow-500" />
                    )}
                    <div>
                      <p className="font-medium">
                        {member.profiles?.first_name || 'Unknown'} {member.profiles?.last_name || 'User'}
                        {member.role === 'owner' && ' (Owner)'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profiles?.email || 'No email available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={member.role === 'owner' ? 'default' : 'outline'}
                      className={member.role === 'owner' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : ''}
                    >
                      {member.role}
                    </Badge>
                    {canManage && member.role !== 'owner' && member.user_id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}