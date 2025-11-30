import { useState, useEffect } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Lock, User, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
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

interface NotificationPreferences {
  comments: boolean;
  mcd: boolean;
  trending: boolean;
  rewards: boolean;
}

interface PrivacyPreferences {
  shareExactGPS: boolean;
}

const SETTINGS_STORAGE_KEY = "user_settings_preferences";

const Settings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { updateProfile } = useUserProfile();
  const { toast } = useToast();
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load preferences from localStorage or use defaults
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    comments: true,
    mcd: true,
    trending: false,
    rewards: true,
  });

  const [privacy, setPrivacy] = useState<PrivacyPreferences>({
    shareExactGPS: true,
  });

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.privacy) setPrivacy(parsed.privacy);
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }
  }, []);

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const settings = { notifications, privacy };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      
      // In the future, this could be saved to backend
      // await updateProfile({ preferences: settings });
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "Could not save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationPreferences, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
    // Auto-save on change
    setTimeout(() => {
      const settings = { notifications: { ...notifications, [key]: value }, privacy };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, 0);
  };

  const handlePrivacyChange = (key: keyof PrivacyPreferences, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
    // Auto-save on change
    setTimeout(() => {
      const settings = { notifications, privacy: { ...privacy, [key]: value } };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }, 0);
  };

  const handleDeactivate = () => {
    // TODO: Implement account deactivation API call
    toast({
      title: "Account deactivation",
      description: "This feature is coming soon. Please contact support.",
      variant: "destructive",
    });
    setShowDeactivateDialog(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-3xl text-center">
          <p className="text-muted-foreground">Please log in to access settings.</p>
          <Button onClick={() => navigate("/login")} className="mt-4">
            Log In
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="space-y-6">
          {/* Notifications */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Notifications</h2>
            </div>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between">
                <Label htmlFor="comments" className="text-sm cursor-pointer">
                  New comments
                </Label>
                <Switch
                  id="comments"
                  checked={notifications.comments}
                  onCheckedChange={(checked) => handleNotificationChange("comments", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mcd" className="text-sm cursor-pointer">
                  MCD updates
                </Label>
                <Switch
                  id="mcd"
                  checked={notifications.mcd}
                  onCheckedChange={(checked) => handleNotificationChange("mcd", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="trending" className="text-sm cursor-pointer">
                  Trending issues
                </Label>
                <Switch
                  id="trending"
                  checked={notifications.trending}
                  onCheckedChange={(checked) => handleNotificationChange("trending", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="rewards" className="text-sm cursor-pointer">
                  Rewards available
                </Label>
                <Switch
                  id="rewards"
                  checked={notifications.rewards}
                  onCheckedChange={(checked) => handleNotificationChange("rewards", checked)}
                />
              </div>
            </div>
          </section>

          {/* Privacy */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Privacy</h2>
            </div>
            <div className="space-y-3 pl-7">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="gps" className="text-sm cursor-pointer">
                    Share exact GPS with MCD only
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Public only sees area name
                  </p>
                </div>
                <Switch
                  id="gps"
                  checked={privacy.shareExactGPS}
                  onCheckedChange={(checked) => handlePrivacyChange("shareExactGPS", checked)}
                />
              </div>
            </div>
          </section>

          {/* Account */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Account</h2>
            </div>
            <div className="space-y-2 pl-7">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/profile/edit")}
              >
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/settings/location")}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Change location
              </Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4 pt-4 border-t border-border">
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeactivateDialog(true)}
            >
              Deactivate Account
            </Button>
          </section>
        </div>
      </main>

      <BottomNav />

      {/* Deactivate Account Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate your account? This action cannot be undone.
              You will lose access to all your reports, points, and rewards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} className="bg-destructive text-destructive-foreground">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
