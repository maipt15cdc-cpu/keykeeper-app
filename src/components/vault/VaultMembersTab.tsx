import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { vaultMembers } from '@/lib/api/vault-members';

interface VaultMembersTabProps {
  vaultId: string;
  canManage: boolean;
  currentUserId?: string;
}

export function VaultMembersTab({ vaultId, canManage, currentUserId }: VaultMembersTabProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [vaultId]);

  const loadMembers = async () => {
    try {
      const { data } = await vaultMembers.getVaultMembers(vaultId);
      setMembers(data || []);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading members...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vault Members</h3>
      {members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No members found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {members.map((member: any) => (
            <Card key={member.user_id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {member.profiles?.first_name} {member.profiles?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.profiles?.email}</p>
                  </div>
                  <Badge variant="outline">{member.role}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}