import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Building, Target } from 'lucide-react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { profiles } from '@/lib/api/profiles';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  gender: z.string().optional(),
  company: z.string().optional(),
  purpose: z.string().optional()
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function CompleteProfile() {
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.user_metadata?.first_name || '',
      lastName: user?.user_metadata?.last_name || '',
      phoneNumber: '',
      gender: '',
      company: '',
      purpose: ''
    }
  });

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const profileData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber || undefined,
        gender: data.gender || undefined,
        company: data.company || undefined,
        purpose: data.purpose || undefined
      };

      // Use createProfile which now handles upsert internally
      const { error } = await profiles.createProfile(user.id, profileData);

      if (error) {
        toast({
          title: 'Profile setup failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        await refreshProfile();
        toast({
          title: 'Profile completed!',
          description: 'Welcome to KeyKeeper. Your profile has been set up successfully.'
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Profile setup failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Complete your profile" 
      subtitle="Tell us a bit about yourself to get started"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                placeholder="John"
                className="pl-10"
                {...form.register('firstName')}
              />
            </div>
            {form.formState.errors.firstName && (
              <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                placeholder="Doe"
                className="pl-10"
                {...form.register('lastName')}
              />
            </div>
            {form.formState.errors.lastName && (
              <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="pl-10"
              {...form.register('phoneNumber')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={(value) => form.setValue('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="non-binary">Non-binary</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Company/Organization</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="company"
              placeholder="Acme Corp"
              className="pl-10"
              {...form.register('company')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">What will you use KeyKeeper for?</Label>
          <div className="relative">
            <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="purpose"
              placeholder="Personal password management, team collaboration, etc."
              className="pl-10 min-h-[80px] resize-none"
              {...form.register('purpose')}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Setting up your profile...' : 'Complete setup'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Fields marked with * are required. You can update this information later in your profile settings.
        </p>
      </form>
    </AuthLayout>
  );
}