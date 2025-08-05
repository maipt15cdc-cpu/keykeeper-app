import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VaultInvitationsTabProps {
  vaultId: string;
}

export function VaultInvitationsTab({ vaultId }: VaultInvitationsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Vault Invitations</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>
      <p className="text-muted-foreground">Invitation management coming soon...</p>
    </div>
  );
}