import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Users, Building } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { vaults } from '@/lib/api/vaults';

const createVaultSchema = z.object({
  name: z.string().min(1, 'Vault name is required').max(50, 'Name must be less than 50 characters'),
  type: z.enum(['personal', 'family', 'team'], {
    required_error: 'Please select a vault type'
  })
});

type CreateVaultForm = z.infer<typeof createVaultSchema>;

interface CreateVaultDialogProps {
  children: React.ReactNode;
  onVaultCreated?: () => void;
}

export function CreateVaultDialog({ children, onVaultCreated }: CreateVaultDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<CreateVaultForm>({
    resolver: zodResolver(createVaultSchema),
    defaultValues: {
      name: '',
      type: 'personal'
    }
  });

  const onSubmit = async (data: CreateVaultForm) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await vaults.createVault(user.id, {
        name: data.name,
        type: data.type
      });

      if (error) {
        toast({
          title: 'Failed to create vault',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Vault created!',
          description: `Your ${data.type} vault "${data.name}" has been created successfully.`
        });
        
        form.reset();
        setOpen(false);
        onVaultCreated?.();
      }
    } catch (error: any) {
      toast({
        title: 'Failed to create vault',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const vaultTypes = [
    {
      value: 'personal',
      label: 'Personal',
      description: 'For your personal passwords and accounts',
      icon: User
    },
    {
      value: 'family',
      label: 'Family',
      description: 'Share passwords with family members',
      icon: Users
    },
    {
      value: 'team',
      label: 'Team',
      description: 'Collaborate with your work team',
      icon: Building
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Vault</DialogTitle>
          <DialogDescription>
            Create a secure vault to store and manage your passwords.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Vault Name</Label>
            <Input
              id="name"
              placeholder="e.g., Work Accounts, Family Passwords"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-3">
            <Label>Vault Type</Label>
            <RadioGroup
              value={form.watch('type')}
              onValueChange={(value) => form.setValue('type', value as any)}
              className="space-y-3"
            >
              {vaultTypes.map((type) => (
                <div key={type.value} className="flex items-start space-x-3">
                  <RadioGroupItem 
                    value={type.value} 
                    id={type.value}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <label 
                      htmlFor={type.value}
                      className="flex items-center gap-2 font-medium text-sm cursor-pointer"
                    >
                      <type.icon className="h-4 w-4" />
                      {type.label}
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
            {form.formState.errors.type && (
              <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Vault'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}