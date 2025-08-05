import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { vaultItems } from '@/lib/api/vault-items';

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  username: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  notes: z.string().optional(),
  tags: z.string().optional()
});

type ItemForm = z.infer<typeof itemSchema>;

interface AddItemDialogProps {
  children: React.ReactNode;
  vaultId: string;
  onItemCreated?: () => void;
}

export function AddItemDialog({ children, vaultId, onItemCreated }: AddItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<ItemForm>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      username: '',
      password: '',
      notes: '',
      tags: ''
    }
  });

  const onSubmit = async (data: ItemForm) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      const { error } = await vaultItems.createVaultItem(vaultId, user.id, {
        title: data.title,
        username: data.username || undefined,
        password: data.password,
        notes: data.notes || undefined,
        tags: tags.length > 0 ? tags : undefined
      });

      if (error) {
        toast({
          title: 'Failed to add item',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Item added!',
          description: `"${data.title}" has been added to your vault.`
        });
        
        form.reset();
        setOpen(false);
        onItemCreated?.();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to add item',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" placeholder="e.g., Gmail Account" {...form.register('title')} />
              {form.formState.errors.title && (
                <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username/Email</Label>
              <Input id="username" placeholder="john@example.com" {...form.register('username')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  className="pr-10"
                  {...form.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" placeholder="work, email, social (comma separated)" {...form.register('tags')} />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." rows={3} {...form.register('notes')} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}