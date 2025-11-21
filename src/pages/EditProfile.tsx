import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const EditProfile = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("Rahul Kumar");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("South Delhi, Delhi");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleSave = () => {
    // Save profile logic here
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/profile")}
          className="mb-4"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <Button variant="outline" size="sm">
              Change Photo
            </Button>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State"
            />
          </div>

          {/* Notification Settings */}
          <div className="space-y-4 pt-4 border-t border-separator">
            <h3 className="font-semibold">Notification Settings</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts
                </p>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="space-y-4 pt-4 border-t border-separator">
            <h3 className="font-semibold">Connected Accounts</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Google</p>
                <p className="text-sm text-muted-foreground">
                  Connected
                </p>
              </div>
              <Button variant="outline" size="sm">
                Disconnect
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  +91 98765 43210
                </p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default EditProfile;
