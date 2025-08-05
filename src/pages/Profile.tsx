import { useState } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={profile?.first_name || ''} readOnly />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={profile?.last_name || ''} readOnly />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} readOnly />
          </div>
          <p className="text-sm text-muted-foreground">
            Profile editing coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}