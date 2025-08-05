import { Shield, Key } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <Shield className="h-12 w-12 text-white" />
              <Key className="h-6 w-6 text-white/80 absolute -bottom-1 -right-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">KeyKeeper</h1>
              <p className="text-white/80 text-sm">Secure Password Management</p>
            </div>
          </div>
          
          <div className="space-y-6 text-white/90">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Military-Grade Encryption</h3>
                <p className="text-sm text-white/70">Your passwords are protected with AES-256 encryption</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Team Collaboration</h3>
                <p className="text-sm text-white/70">Share credentials securely with your team or family</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-white/60 mt-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Zero-Knowledge Architecture</h3>
                <p className="text-sm text-white/70">We can't see your passwords, even if we wanted to</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-12">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-text">KeyKeeper</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}