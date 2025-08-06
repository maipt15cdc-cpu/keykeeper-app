import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { vaultInvitations } from '@/lib/api/vault-invitations';

export default function InvitationAccept() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!authLoading && token) {
      loadInvitation();
    }
  }, [token, authLoading]);

  const loadInvitation = async () => {
    if (!token) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await vaultInvitations.getInvitationByToken(token);
      
      if (error || !data) {
        setError('This invitation is invalid, expired, or has already been accepted');
      } else {
        setInvitation(data);
      }
    } catch (error: any) {
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user || !token) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to accept this invitation',
        variant: 'destructive'
      });
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setAccepting(true);
    try {
      const { error } = await vaultInvitations.acceptInvitation(token, user.id);
      
      if (error) {
        toast({
          title: 'Failed to accept invitation',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setAccepted(true);
        toast({
          title: 'Invitation accepted',
          description: `You now have access to ${invitation.vault.name}`
        });
        
        // Redirect to the vault after a short delay
        setTimeout(() => {
          navigate(`/vault/${invitation.vault_id}`);
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: 'Failed to accept invitation',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    navigate('/dashboard');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Invitation Accepted!</CardTitle>
            <CardDescription>
              You now have access to {invitation.vault.name}. Redirecting you to the vault...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to accept this vault invitation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
            >
              Log In
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/register')}
            >
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>Vault Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a vault
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{invitation.vault.name}</h3>
              <div className="flex justify-center gap-2">
                <Badge variant="secondary" className="capitalize">
                  {invitation.vault.type}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {invitation.role} Access
                </Badge>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground text-center">
              <p>Invited to: <strong>{invitation.email}</strong></p>
              <p>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDecline}
              disabled={accepting}
            >
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}