import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, AlertCircle, Loader2, Key, Shield } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { vaultShareLinks } from '@/lib/api/vault-share-links';

interface SharedVaultItem {
  id: string;
  title: string;
  username: string | null;
  password: string;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
}

export default function ShareAccess() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [needsPasscode, setNeedsPasscode] = useState(false);
  const [vault, setVault] = useState<any>(null);
  const [items, setItems] = useState<SharedVaultItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (token) {
      verifyAccess();
    }
  }, [token]);

  const verifyAccess = async (providedPasscode?: string) => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    setVerifying(true);
    try {
      const { valid, error: verifyError, data } = await vaultShareLinks.verifyShareLinkAccess(
        token, 
        providedPasscode || passcode
      );

      if (!valid) {
        if (verifyError === 'Passcode required') {
          setNeedsPasscode(true);
          setError(null);
        } else if (verifyError === 'Invalid passcode') {
          setError('Invalid passcode');
          setNeedsPasscode(true);
        } else {
          setError(verifyError || 'Access denied');
        }
        setLoading(false);
        setVerifying(false);
        return;
      }

      // Access granted, load vault and items
      setVault(data.vault);
      setNeedsPasscode(false);
      setError(null);

      // Load vault items
      const { data: itemsData, error: itemsError } = await vaultShareLinks.getSharedVaultItems(data.vault_id);
      
      if (itemsError) {
        toast({
          title: 'Failed to load vault items',
          description: itemsError.message,
          variant: 'destructive'
        });
      } else {
        setItems(itemsData || []);
      }
    } catch (error: any) {
      setError('Failed to access shared vault');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter a passcode');
      return;
    }
    verifyAccess(passcode);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared vault...</p>
        </div>
      </div>
    );
  }

  if (error && !needsPasscode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (needsPasscode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Passcode Required</CardTitle>
            <CardDescription>
              This shared vault is protected with a passcode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className={error ? 'border-destructive' : ''}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Access Vault
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{vault?.name}</h1>
          <div className="flex justify-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {vault?.type}
            </Badge>
            <Badge variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              Read Only
            </Badge>
          </div>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto">
          You're viewing a shared vault. This is a read-only view of the vault contents.
        </p>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground">
            This vault doesn't contain any items yet
          </p>
        </div>
      ) : (
        <div className="grid gap-4 max-w-4xl mx-auto">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
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
                  
                  <div className="space-y-3 text-sm">
                    {item.username && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-0 flex-shrink-0 w-20">Username:</span>
                        <span className="font-mono">{item.username}</span>
                      </div>
                    )}
                    
                    {item.password && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground min-w-0 flex-shrink-0 w-20">Password:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {showPasswords[item.id] ? item.password : maskPassword(item.password)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(item.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showPasswords[item.id] ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {item.notes && (
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground min-w-0 flex-shrink-0 w-20">Notes:</span>
                        <span className="break-words">{item.notes}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(item.created_at).toLocaleDateString()}
                    </div>
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