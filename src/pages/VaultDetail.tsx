import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Users, Key, Share2, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { vaults } from '@/lib/api/vaults';
import { vaultMembers } from '@/lib/api/vault-members';

import { VaultItemsTab } from '@/components/vault/VaultItemsTab';
import { VaultMembersTab } from '@/components/vault/VaultMembersTab';
import { VaultInvitationsTab } from '@/components/vault/VaultInvitationsTab';
import { VaultShareLinksTab } from '@/components/vault/VaultShareLinksTab';

interface VaultDetails {
  id: string;
  name: string;
  type: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export default function VaultDetail() {
  const { vaultId } = useParams<{ vaultId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [vault, setVault] = useState<VaultDetails | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items');

  useEffect(() => {
    if (vaultId && user) {
      loadVaultDetails();
    }
  }, [vaultId, user]);

  const loadVaultDetails = async () => {
    if (!vaultId || !user) return;

    try {
      const [vaultResponse, roleResponse] = await Promise.all([
        vaults.getVault(vaultId),
        vaultMembers.getUserRole(vaultId, user.id)
      ]);

      if (vaultResponse.error) {
        toast({
          title: 'Failed to load vault',
          description: vaultResponse.error.message,
          variant: 'destructive'
        });
        navigate('/dashboard');
        return;
      }

      setVault(vaultResponse.data);
      
      // For personal vaults, owner has all permissions
      if (vaultResponse.data?.type === 'personal') {
        setUserRole('owner');
      } else {
        setUserRole(roleResponse.data?.role || null);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load vault',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const canManageVault = userRole === 'owner';
  const canEditItems = userRole === 'owner' || userRole === 'edit';
  const isSharedVault = vault?.type === 'family' || vault?.type === 'team';

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Vault not found</h3>
          <p className="text-muted-foreground mb-4">
            The vault you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{vault.name}</h1>
              <Badge variant="secondary" className="capitalize">
                {vault.type}
              </Badge>
              {userRole && (
                <Badge variant="outline" className="text-xs">
                  {userRole}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Created {new Date(vault.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {canManageVault && (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="items" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">Items</span>
          </TabsTrigger>
          
          {isSharedVault && (
            <>
              <TabsTrigger value="members" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Members</span>
              </TabsTrigger>
              
              {canManageVault && (
                <>
                  <TabsTrigger value="invitations" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Invitations</span>
                  </TabsTrigger>
                  
                  <TabsTrigger value="sharing" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Share Links</span>
                  </TabsTrigger>
                </>
              )}
            </>
          )}
        </TabsList>

        <TabsContent value="items" className="space-y-6">
          <VaultItemsTab 
            vaultId={vault.id} 
            canEdit={canEditItems}
            userRole={userRole}
          />
        </TabsContent>

        {isSharedVault && (
          <>
            <TabsContent value="members" className="space-y-6">
              <VaultMembersTab 
                vaultId={vault.id}
                canManage={canManageVault}
                currentUserId={user?.id}
              />
            </TabsContent>

            {canManageVault && (
              <>
                <TabsContent value="invitations" className="space-y-6">
                  <VaultInvitationsTab vaultId={vault.id} />
                </TabsContent>

                <TabsContent value="sharing" className="space-y-6">
                  <VaultShareLinksTab vaultId={vault.id} />
                </TabsContent>
              </>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}