import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Lock, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

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
                <Label htmlFor="comments" className="text-sm">
                  New comments
                </Label>
                <Switch id="comments" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="mcd" className="text-sm">
                  MCD updates
                </Label>
                <Switch id="mcd" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="trending" className="text-sm">
                  Trending issues
                </Label>
                <Switch id="trending" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="rewards" className="text-sm">
                  Rewards available
                </Label>
                <Switch id="rewards" defaultChecked />
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
                  <Label htmlFor="gps" className="text-sm">
                    Share exact GPS with MCD only
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Public only sees area name
                  </p>
                </div>
                <Switch id="gps" defaultChecked />
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
              <Button variant="outline" className="w-full justify-start">
                Manage connected accounts
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
          <section className="space-y-4 pt-4 border-t border-separator">
            <Button variant="destructive" className="w-full">
              Deactivate Account
            </Button>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
