import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Settings</h1>

      {/* Profile */}
      <Card className="mb-6 rounded-xl shadow-sm">
        <CardHeader><CardTitle className="text-lg">Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Name</Label><Input defaultValue={user?.name} /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue={user?.email} /></div>
          </div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      {/* Organization */}
      <Card className="mb-6 rounded-xl shadow-sm">
        <CardHeader><CardTitle className="text-lg">Organization</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Organization Name</Label><Input defaultValue={user?.orgName} /></div>
          <Button size="sm">Update Organization</Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card className="mb-6 rounded-xl shadow-sm">
        <CardHeader><CardTitle className="text-lg">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Current Password</Label><Input type="password" placeholder="••••••••" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>New Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" /></div>
          </div>
          <Button size="sm">Update Password</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="rounded-xl border-destructive/30 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" size="sm">Delete Account</Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SettingsPage;
