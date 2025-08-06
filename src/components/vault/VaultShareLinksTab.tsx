import { useState, useEffect } from 'react';
import { Share2, Copy, Trash2, Eye, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vaultShareLinks, VaultShareLink } from '@/lib/api/vault-share-links';

const shareLinkSchema = z.object({
  expires_at: z.string().optional(),
  max_views: z.number().optional(),
  passcode: z.string().optional(),
  has_expiry: z.boolean().default(false),
  has_view_limit: z.boolean().default(false),
  has_passcode: z.boolean().default(false)
});

type ShareLinkFormData = z.infer<typeof shareLinkSchema>;

interface VaultShareLinksTabProps {
  vaultId: string;
  canManage: boolean;
}

export function VaultShareLinksTab({ vaultId, canManage }: VaultShareLinksTabProps) {
  const [shareLinks, setShareLinks] = useState<VaultShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<ShareLinkFormData>({
    resolver: zodResolver(shareLinkSchema),
    defaultValues: {
      has_expiry: false,
      has_view_limit: false,
      has_passcode: false
    }
  });

  const hasExpiry = form.watch('has_expiry');
  const hasViewLimit = form.watch('has_view_limit');
  const hasPasscode = form.watch('has_passcode');

  useEffect(() => {
    loadShareLinks();
  }, [vaultId]);

  const loadShareLinks = async () => {
    try {
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

  const onSubmit = async (data: ShareLinkFormData) => {
    setSubmitting(true);
    try {
      const linkData: any = { vault_id: vaultId };
      
      if (data.has_expiry && data.expires_at) {
        linkData.expires_at = new Date(data.expires_at).toISOString();
      }
      
      if (data.has_view_limit && data.max_views) {
        linkData.max_views = data.max_views;
      }
      
      if (data.has_passcode && data.passcode) {
        linkData.passcode = data.passcode;
      }

      const { data: shareLink, error } = await vaultShareLinks.createShareLink(linkData);

      if (error) {
        toast({
          title: 'Failed to create share link',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Share link created',
          description: 'The share link has been created successfully'
        });
        form.reset();
        setDialogOpen(false);
        loadShareLinks();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to create share link',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (token: string) => {
    try {
      const { error } = await vaultShareLinks.revokeShareLink(token);
      if (error) {
        toast({
          title: 'Failed to revoke share link',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Share link revoked',
          description: 'The share link has been revoked'
        });
        loadShareLinks();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to revoke share link',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const copyShareLink = (token: string) => {
    const shareUrl = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Share link copied',
      description: 'The share link has been copied to your clipboard'
    });
  };

  const getStatusBadge = (link: VaultShareLink) => {
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (link.max_views && link.views_used >= link.max_views) {
      return <Badge variant="destructive">Max views reached</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return <div>Loading share links...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Share Links</h3>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Share2 className="h-4 w-4 mr-2" />
                Create Share Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Share Link</DialogTitle>
                <DialogDescription>
                  Create a secure link to share this vault with others. Share links provide read-only access.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="has_expiry"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Set Expiry Date
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Link will expire after this date
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {hasExpiry && (
                      <FormField
                        control={form.control}
                        name="expires_at"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="has_view_limit"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Set View Limit
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Link will become inactive after max views
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {hasViewLimit && (
                      <FormField
                        control={form.control}
                        name="max_views"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Views</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1"
                                placeholder="Enter maximum views"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="has_passcode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              Require Passcode
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Viewers must enter a passcode to access
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    {hasPasscode && (
                      <FormField
                        control={form.control}
                        name="passcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Passcode</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Enter passcode"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Link'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {shareLinks.length === 0 ? (
        <div className="text-center py-8">
          <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No share links found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shareLinks.map((link) => (
            <Card key={link.token}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(link)}
                      {link.passcode_hash && <Badge variant="outline"><Shield className="h-3 w-3 mr-1" />Protected</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Created {new Date(link.created_at).toLocaleDateString()}</div>
                      {link.expires_at && <div>Expires {new Date(link.expires_at).toLocaleDateString()}</div>}
                      {link.max_views && <div>Views: {link.views_used}/{link.max_views}</div>}
                    </div>
                  </div>
                  
                  {canManage && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyShareLink(link.token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(link.token)}
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
    </div>
  );
}