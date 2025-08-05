import { useState } from 'react';
import { Eye, EyeOff, Copy, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ViewItemDialogProps {
  item: any;
  canEdit: boolean;
  onClose: () => void;
  onItemUpdated: () => void;
  onItemDeleted: () => void;
}

export function ViewItemDialog({ item, canEdit, onClose, onItemUpdated, onItemDeleted }: ViewItemDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} copied to clipboard` });
  };

  return (
    <Dialog open={!!item} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {item.username && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Username:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono">{item.username}</span>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.username, 'Username')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Password:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{showPassword ? item.password : '•'.repeat(item.password.length)}</span>
              <Button size="sm" variant="ghost" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.password, 'Password')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {item.tags && (
            <div className="space-y-2">
              <span className="font-medium">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {item.notes && (
            <div className="space-y-2">
              <span className="font-medium">Notes:</span>
              <p className="text-sm text-muted-foreground">{item.notes}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {canEdit && (
              <Button variant="destructive" onClick={onItemDeleted}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}