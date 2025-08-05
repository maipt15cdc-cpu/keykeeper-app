import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VaultShareLinksTabProps {
  vaultId: string;
}

export function VaultShareLinksTab({ vaultId }: VaultShareLinksTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Share Links</h3>
        <Button>
          <Share2 className="h-4 w-4 mr-2" />
          Create Share Link
        </Button>
      </div>
      <p className="text-muted-foreground">Share link management coming soon...</p>
    </div>
  );
}