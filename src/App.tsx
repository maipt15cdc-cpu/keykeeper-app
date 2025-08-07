import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Auth pages
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CompleteProfile from './pages/CompleteProfile';

// App pages
import Dashboard from './pages/Dashboard';
import VaultDetail from './pages/VaultDetail';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from "./pages/NotFound";
import InvitationAccept from './pages/InvitationAccept';
import ShareAccess from './pages/ShareAccess';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user && !profile) {
        navigate('/complete-profile');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return <>{children}</>;
}

function CompleteProfileRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (user && profile) {
        navigate('/dashboard');
      }
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/complete-profile" element={<CompleteProfileRoute><CompleteProfile /></CompleteProfileRoute>} />
            
            {/* Public routes */}
            <Route path="/invitations/accept" element={<InvitationAccept />} />
            <Route path="/share/:token" element={<ShareAccess />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vault/:vaultId" element={<VaultDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
