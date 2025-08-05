import { useState, useEffect } from 'react';
import { Plus, Search, Eye, EyeOff, Copy, Edit, Trash2, Key } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { vaultItems } from '@/lib/api/vault-items';
import { AddItemDialog } from './AddItemDialog';
import { ViewItemDialog } from './ViewItemDialog';

interface VaultItem {
  id: string;
  title: string;
  username: string | null;
  password: string;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

interface VaultItemsTabProps {
  vaultId: string;
  canEdit: boolean;
  userRole: string | null;
}

export function VaultItemsTab({ vaultId, canEdit, userRole }: VaultItemsTabProps) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, [vaultId]);

  const loadItems = async () => {
    try {
      const { data, error } = await vaultItems.getVaultItems(vaultId);
      
      if (error) {
        toast({
          title: 'Failed to load items',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setItems(data || []);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to load items',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleItemCreated = () => {
    loadItems();
  };

  const handleItemUpdated = () => {
    loadItems();
    setSelectedItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await vaultItems.deleteVaultItem(itemId);
      
      if (error) {
        toast({
          title: 'Failed to delete item',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Item deleted',
          description: 'The item has been deleted successfully'
        });
        loadItems();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to delete item',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${type} copied`,
      description: `${type} has been copied to your clipboard`
    });
  };

  const togglePasswordVisibility = (itemId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const maskPassword = (password: string) => {
    return '•'.repeat(password.length);
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {canEdit && (
          <AddItemDialog vaultId={vaultId} onItemCreated={handleItemCreated}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </AddItemDialog>
        )}
      </div>

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {items.length === 0 ? 'No items yet' : 'No items found'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {items.length === 0 
              ? 'Add your first password or credential to this vault'
              : 'Try adjusting your search criteria'
            }
          </p>
          {items.length === 0 && canEdit && (
            <AddItemDialog vaultId={vaultId} onItemCreated={handleItemCreated}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </AddItemDialog>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card 
              key={item.id}
              className="group hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {item.username && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground min-w-0 flex-shrink-0">Username:</span>
                          <span className="font-mono truncate">{item.username}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.username!, 'Username');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-0 flex-shrink-0">Password:</span>
                        <span className="font-mono truncate">
                          {showPasswords[item.id] ? item.password : maskPassword(item.password)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePasswordVisibility(item.id);
                            }}
                          >
                            {showPasswords[item.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.password, 'Password');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this item?')) {
                            handleDeleteItem(item.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View/Edit Item Dialog */}
      {selectedItem && (
        <ViewItemDialog
          item={selectedItem}
          canEdit={canEdit}
          onClose={() => setSelectedItem(null)}
          onItemUpdated={handleItemUpdated}
          onItemDeleted={() => {
            handleDeleteItem(selectedItem.id);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}