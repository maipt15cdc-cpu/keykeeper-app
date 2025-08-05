import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle2 } from 'lucide-react';

import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/api/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { toast } = useToast();

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    
    try {
      const { error } = await auth.resetPassword(data.email);

      if (error) {
        toast({
          title: 'Password reset failed',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        setEmailSent(true);
      }
    } catch (error: any) {
      toast({
        title: 'Password reset failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout 
        title="Check your email" 
        subtitle="We've sent you a password reset link"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We've sent a password reset link to <strong>{form.getValues('email')}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to reset your password.
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = 'mailto:'}
              variant="outline" 
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Open Email App
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Forgot password?" 
      subtitle="Enter your email to receive a reset link"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="pl-10"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Sending reset link...' : 'Send reset link'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{' '}
          <Link 
            to="/login" 
            className="text-primary hover:underline font-medium"
          >
            Sign in here
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}