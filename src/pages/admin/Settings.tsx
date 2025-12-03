import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bell, Shield, User, Save, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers } from "@/hooks/useAdminUsers";

interface AdminPreferences {
  emailNotifications: boolean;
  reportAssignments: boolean;
  resolutionAlerts: boolean;
  weeklyDigest: boolean;
}

const ADMIN_SETTINGS_STORAGE_KEY = "admin_settings_preferences";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { admins } = useAdminUsers();
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [preferences, setPreferences] = useState<AdminPreferences>({
    emailNotifications: true,
    reportAssignments: true,
    resolutionAlerts: true,
    weeklyDigest: false,
  });

  const [profile, setProfile] = useState({
    displayName: user?.username || "",
    email: user?.email || "",
    region: user?.adminRegion || "",
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      } catch (e) {
        console.error("Failed to load admin settings:", e);
      }
    }

    // Load user profile data
    if (user) {
      setProfile({
        displayName: user.username || "",
        email: user.email || "",
        region: user.adminRegion || "",
      });
    }
  }, [user]);

  const handlePreferenceChange = (key: keyof AdminPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    // Auto-save
    setTimeout(() => {
      localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify({ ...preferences, [key]: value }));
    }, 0);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to update admin profile
      // await updateAdminProfile(profile);
      
      localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(preferences));
      
      toast({
        title: "Settings saved",
        description: "Your admin settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Could not save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion API call
    toast({
      title: "Account deletion",
      description: "This feature is coming soon. Please contact support.",
      variant: "destructive",
    });
    setShowDeleteDialog(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage your admin account preferences and notifications
        </p>
      </div>

      {/* Profile Settings */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="your@email.com"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support to update.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Assigned Region</Label>
            <Input
              id="region"
              value={profile.region}
              onChange={(e) => setProfile({ ...profile, region: e.target.value })}
              placeholder="Your assigned region"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Region assignment is managed by super admins.
            </p>
          </div>

          <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="emailNotifications" className="text-sm cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Receive email alerts for important updates
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="reportAssignments" className="text-sm cursor-pointer">
                Report Assignments
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Get notified when reports are assigned to you
              </p>
            </div>
            <Switch
              id="reportAssignments"
              checked={preferences.reportAssignments}
              onCheckedChange={(checked) => handlePreferenceChange("reportAssignments", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="resolutionAlerts" className="text-sm cursor-pointer">
                Resolution Alerts
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Notifications when assigned reports are resolved
              </p>
            </div>
            <Switch
              id="resolutionAlerts"
              checked={preferences.resolutionAlerts}
              onCheckedChange={(checked) => handlePreferenceChange("resolutionAlerts", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label htmlFor="weeklyDigest" className="text-sm cursor-pointer">
                Weekly Digest
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Receive weekly summary of your region's activity
              </p>
            </div>
            <Switch
              id="weeklyDigest"
              checked={preferences.weeklyDigest}
              onCheckedChange={(checked) => handlePreferenceChange("weeklyDigest", checked)}
            />
          </div>
        </div>
      </section>

      {/* Admin Tools */}
      <section className="bg-card rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Admin Tools</h2>
        </div>
        
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Export Reports Data
          </Button>
          <Button variant="outline" className="w-full justify-start">
            View System Logs
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Manage Team Members
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-card rounded-xl border border-destructive/50 p-6 space-y-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Irreversible and destructive actions
          </p>
        </div>
        
        <Button
          variant="destructive"
          className="w-full sm:w-auto"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Admin Account
        </Button>
      </section>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your admin account? This action cannot be undone.
              All your admin privileges will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

