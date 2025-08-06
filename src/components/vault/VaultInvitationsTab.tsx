import { useState, useEffect } from 'react';
import { Plus, Mail, Clock, Check, X, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vaultInvitations, VaultInvitation } from '@/lib/api/vault-invitations';

const invitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['edit', 'view'], { required_error: 'Please select a role' })
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface VaultInvitationsTabProps {
  vaultId: string;
  canManage: boolean;
}

export function VaultInvitationsTab({ vaultId, canManage }: VaultInvitationsTabProps) {
  const [invitations, setInvitations] = useState<VaultInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      role: 'view'
    }
  });

  useEffect(() => {
    loadInvitations();
  }, [vaultId]);

  const loadInvitations = async () => {
    try {
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

  const onSubmit = async (data: InvitationFormData) => {
    setSubmitting(true);
    try {
      const { data: invitation, error } = await vaultInvitations.createInvitation({
        email: data.email,
        role: data.role,
        vault_id: vaultId
      });

      if (error) {
        toast({
          title: 'Failed to send invitation',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Invitation sent',
          description: `Invitation sent to ${data.email}`
        });
        form.reset();
        setDialogOpen(false);
        loadInvitations();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to send invitation',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      const { error } = await vaultInvitations.revokeInvitation(invitationId);
      if (error) {
        toast({
          title: 'Failed to revoke invitation',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Invitation revoked',
          description: 'The invitation has been revoked'
        });
        loadInvitations();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to revoke invitation',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invitation/accept?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: 'Invitation link copied',
      description: 'The invitation link has been copied to your clipboard'
    });
  };

  const getStatusBadge = (invitation: VaultInvitation) => {
    if (invitation.accepted) {
      return <Badge variant="default" className="gap-1"><Check className="h-3 w-3" />Accepted</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive" className="gap-1"><X className="h-3 w-3" />Expired</Badge>;
    }
    
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
  };

  if (loading) {
    return <div>Loading invitations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vault Invitations</h3>
        {canManage && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Send Invitation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Vault Invitation</DialogTitle>
                <DialogDescription>
                  Invite someone to access this vault. They will receive an email with an invitation link.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="view">View Only</SelectItem>
                            <SelectItem value="edit">Can Edit</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Invitation'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {invitations.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No invitations found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{invitation.email}</p>
                      {getStatusBadge(invitation)}
                      <Badge variant="outline" className="capitalize">
                        {invitation.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sent {new Date(invitation.created_at).toLocaleDateString()}
                      {invitation.expires_at && ` • Expires ${new Date(invitation.expires_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  
                  {canManage && !invitation.accepted && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(invitation.id)}
                      >
                        <X className="h-4 w-4" />
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