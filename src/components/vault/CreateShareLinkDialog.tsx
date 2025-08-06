import { useState } from 'react';
import { Link, Copy, Calendar, Eye, Lock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vaultShareLinks } from '@/lib/api/vault-share-links';

const shareLinkSchema = z.object({
  expires_at: z.string().optional(),
  max_views: z.number().optional(),
  passcode: z.string().optional()
});

type ShareLinkFormData = z.infer<typeof shareLinkSchema>;

interface CreateShareLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vaultId: string;
  onLinkCreated: () => void;
}

export function CreateShareLinkDialog({ open, onOpenChange, vaultId, onLinkCreated }: CreateShareLinkDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [hasViewLimit, setHasViewLimit] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ShareLinkFormData>({
    resolver: zodResolver(shareLinkSchema),
    defaultValues: {
      expires_at: '',
      max_views: undefined,
      passcode: ''
    }
  });

  const onSubmit = async (data: ShareLinkFormData) => {
    setSubmitting(true);
    try {
      const payload: any = {
        vault_id: vaultId
      };

      if (hasExpiry && data.expires_at) {
        payload.expires_at = new Date(data.expires_at).toISOString();
      }

      if (hasViewLimit && data.max_views) {
        payload.max_views = data.max_views;
      }

      if (hasPasscode && data.passcode) {
        payload.passcode = data.passcode;
      }

      const { data: shareLink, error } = await vaultShareLinks.createShareLink(payload);

      if (error) {
        toast({
          title: 'Failed to create share link',
          description: error.message,
          variant: 'destructive'
        });
      } else if (shareLink) {
        const fullUrl = `${window.location.origin}/share/${shareLink.token}`;
        setCreatedLink(fullUrl);
        onLinkCreated();
        toast({
          title: 'Share link created!',
          description: 'Your share link has been created successfully'
        });
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

  const copyToClipboard = async () => {
    if (createdLink) {
      try {
        await navigator.clipboard.writeText(createdLink);
        toast({
          title: 'Link copied!',
          description: 'Share link has been copied to your clipboard'
        });
      } catch (error) {
        toast({
          title: 'Failed to copy',
          description: 'Please copy the link manually',
          variant: 'destructive'
        });
      }
    }
  };

  const handleClose = () => {
    setCreatedLink(null);
    form.reset();
    setHasExpiry(false);
    setHasViewLimit(false);
    setHasPasscode(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Create Share Link
          </DialogTitle>
          <DialogDescription>
            Create a secure link to share this vault with others.
          </DialogDescription>
        </DialogHeader>

        {createdLink ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={createdLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              {/* Expiry Date */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Set expiry date
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Link will expire after this date
                  </p>
                </div>
                <Switch
                  checked={hasExpiry}
                  onCheckedChange={setHasExpiry}
                />
              </div>
              
              {hasExpiry && (
                <div className="space-y-2">
                  <Input
                    type="datetime-local"
                    {...form.register('expires_at')}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}

              {/* View Limit */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Set view limit
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Limit how many times the link can be accessed
                  </p>
                </div>
                <Switch
                  checked={hasViewLimit}
                  onCheckedChange={setHasViewLimit}
                />
              </div>
              
              {hasViewLimit && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Maximum views"
                    min="1"
                    {...form.register('max_views', { valueAsNumber: true })}
                  />
                </div>
              )}

              {/* Passcode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Require passcode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Protect the link with a passcode
                  </p>
                </div>
                <Switch
                  checked={hasPasscode}
                  onCheckedChange={setHasPasscode}
                />
              </div>
              
              {hasPasscode && (
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter passcode"
                    {...form.register('passcode')}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Creating...
                  </>
                ) : (
                  'Create Link'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}