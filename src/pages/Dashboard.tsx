import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Vault, Users, User, Search, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { vaults } from '@/lib/api/vaults';
import { CreateVaultDialog } from '@/components/vault/CreateVaultDialog';

interface VaultWithDetails {
  id: string;
  name: string;
  type: string;
  created_at: string;
  owner_id: string;
  member_count?: number;
}

export default function Dashboard() {
  const [userVaults, setUserVaults] = useState<VaultWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadVaults();
  }, [user]);

  const loadVaults = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await vaults.getUserVaults(user.id);
      
      if (error) {
        toast({
          title: 'Failed to load vaults',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setUserVaults(data || []);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load vaults',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredVaults = userVaults.filter(vault => {
    const matchesSearch = vault.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || vault.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getVaultIcon = (type: string) => {
    switch (type) {
      case 'personal':
        return <User className="h-5 w-5 text-primary" />;
      case 'family':
      case 'team':
        return <Users className="h-5 w-5 text-accent" />;
      default:
        return <Vault className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getVaultBadgeColor = (type: string) => {
    switch (type) {
      case 'personal':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'family':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      case 'team':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleVaultCreated = () => {
    loadVaults();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Vaults</h1>
            <p className="text-muted-foreground">
              Manage your password vaults and secure credentials
            </p>
          </div>
          
          <CreateVaultDialog onVaultCreated={handleVaultCreated}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Vault
            </Button>
          </CreateVaultDialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vaults..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vaults Grid */}
      {filteredVaults.length === 0 ? (
        <div className="text-center py-12">
          <Vault className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {userVaults.length === 0 ? 'No vaults yet' : 'No vaults found'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {userVaults.length === 0 
              ? 'Create your first vault to start storing passwords securely'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {userVaults.length === 0 && (
            <CreateVaultDialog onVaultCreated={handleVaultCreated}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Vault
              </Button>
            </CreateVaultDialog>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVaults.map((vault) => (
            <Card 
              key={vault.id}
              className="vault-card cursor-pointer group"
              onClick={() => navigate(`/vault/${vault.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getVaultIcon(vault.type)}
                    <div className="space-y-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {vault.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getVaultBadgeColor(vault.type)}`}
                        >
                          {vault.type}
                        </Badge>
                        {vault.type !== 'personal' && (
                          <span className="text-xs text-muted-foreground">
                            {vault.member_count || 0} members
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Created {new Date(vault.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      <CreateVaultDialog onVaultCreated={handleVaultCreated}>
        <Button className="floating-button lg:hidden">
          <Plus className="h-6 w-6" />
        </Button>
      </CreateVaultDialog>
    </div>
  );
}