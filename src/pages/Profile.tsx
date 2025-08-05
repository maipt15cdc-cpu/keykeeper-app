import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, Building, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      gender: '',
      company: '',
      purpose: ''
    }
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phoneNumber: profile.phone_number || '',
        gender: profile.gender || '',
        company: profile.company || '',
        purpose: profile.purpose || ''
      });
    }
  }, [profile, form]);

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

      const { error } = await profiles.updateProfile(user.id, profileData);

      if (error) {
        toast({
          title: 'Update failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        await refreshProfile();
        setIsEditing(false);
        toast({
          title: 'Profile updated!',
          description: 'Your profile has been updated successfully.'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Update failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      phoneNumber: profile?.phone_number || '',
      gender: profile?.gender || '',
      company: profile?.company || '',
      purpose: profile?.purpose || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                    readOnly={!isEditing}
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
                    readOnly={!isEditing}
                    {...form.register('lastName')}
                  />
                </div>
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={user?.email || ''} readOnly className="pl-10 bg-muted" />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
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
                  readOnly={!isEditing}
                  {...form.register('phoneNumber')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                disabled={!isEditing}
                value={form.watch('gender')}
                onValueChange={(value) => form.setValue('gender', value)}
              >
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
                  readOnly={!isEditing}
                  {...form.register('company')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">What do you use KeyKeeper for?</Label>
              <div className="relative">
                <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="purpose"
                  placeholder="Personal password management, team collaboration, etc."
                  className="pl-10 min-h-[80px] resize-none"
                  readOnly={!isEditing}
                  {...form.register('purpose')}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Updating...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}