import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

const BIO_LIMIT = 300;

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { updateProfile, isUpdating } = useUserProfile();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [touched, setTouched] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; bio?: string; avatarUrl?: string }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/profile/edit");
      return;
    }
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user, isAuthenticated, navigate]);

  const originalState = useMemo(
    () => ({
      username: user?.username || "",
      bio: user?.bio || "",
      avatarUrl: user?.avatarUrl || "",
    }),
    [user]
  );

  const isDirty =
    username !== originalState.username ||
    bio !== originalState.bio ||
    avatarUrl !== originalState.avatarUrl;

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!username.trim()) {
      nextErrors.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(username) || username.length > 30) {
      nextErrors.username = "Use 1-30 letters, numbers or underscore.";
    }

    if (bio.length > BIO_LIMIT) {
      nextErrors.bio = `Bio must be at most ${BIO_LIMIT} characters.`;
    }

    if (avatarUrl && !/^https?:\/\/.+/.test(avatarUrl)) {
      nextErrors.avatarUrl = "Avatar must be a valid URL starting with http or https.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    setTouched(true);
    if (!validate()) return;

    try {
      await updateProfile({
        username: username.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
      });
      navigate("/profile");
    } catch {
      // Toast handled in hook
    }
  };

  const handleReset = () => {
    setUsername(originalState.username);
    setBio(originalState.bio);
    setAvatarUrl(originalState.avatarUrl);
    setErrors({});
    setTouched(false);
    toast({
      title: "Changes discarded",
      description: "Your profile edits have been reset.",
    });
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
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setTouched(true);
              }}
              onBlur={validate}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-xs text-destructive mt-1">{errors.username}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value);
                setTouched(true);
              }}
              onBlur={validate}
              placeholder="Tell us about yourself..."
              rows={3}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{bio.length}/{BIO_LIMIT}</span>
              {errors.bio && <span className="text-destructive">{errors.bio}</span>}
            </div>
          </div>
          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setTouched(true);
              }}
              onBlur={validate}
              placeholder="https://example.com/avatar.jpg"
            />
            {errors.avatarUrl && (
              <p className="text-xs text-destructive mt-1">{errors.avatarUrl}</p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col gap-2">
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={isUpdating || !isDirty}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleReset}
              disabled={!isDirty}
            >
              Cancel changes
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default EditProfile;
