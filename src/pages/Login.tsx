import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";
import { uploadImage } from "@/services/reportService";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const { login, signup, user } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [region, setRegion] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Handle role-based redirect after successful login
  useEffect(() => {
    if (shouldRedirect && user) {
      if (user.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'field_admin') {
        navigate('/field-admin/dashboard');
      } else if (redirectTo && redirectTo !== '/') {
        navigate(redirectTo);
      } else {
        navigate('/');
      }
      setShouldRedirect(false);
    }
  }, [user, shouldRedirect, navigate, redirectTo]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }
    
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Clear URL input when file is selected
    setAvatarUrl("");
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
        toast({ title: "Welcome back!" });
      } else {
        // Handle avatar: prefer file upload over URL
        let finalAvatarUrl = avatarUrl;
        if (avatarFile) {
          try {
            finalAvatarUrl = await uploadImage(avatarFile);
          } catch (error) {
            toast({
              title: "Avatar upload failed",
              description: "Please try again or use a URL instead",
              variant: "destructive",
            });
            setIsSubmitting(false);
            return;
          }
        }

        // Prepare region - can be a string or object
        const regionData = region.trim() || undefined;

        await signup({
          email,
          password,
          username,
          region: regionData,
          bio: bio.trim() || undefined,
          avatar_url: finalAvatarUrl || undefined,
        });
        toast({ title: "Account created", description: "You're all set!" });
      }
      
      // Trigger redirect check after user state updates
      setShouldRedirect(true);
    } catch (error) {
      let message = "Something went wrong. Please try again.";
      if (isAxiosError(error)) {
        message = error.response?.data?.error?.message || message;
      }
      toast({ title: "Unable to continue", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              {mode === "login" ? "Welcome back!" : "Join CleanLink"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Login to keep tracking civic issues."
                : "Create an account and start reporting civic issues."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="cleanlink_hero"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Region (Optional)</Label>
                  <Input
                    id="region"
                    placeholder="e.g., Mumbai, Maharashtra"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your city or area to help connect you with local issues
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/500 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Avatar (Optional)</Label>
                  <div className="space-y-3">
                    {avatarPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-24 h-24 rounded-full object-cover border-2 border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={handleRemoveAvatar}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Upload avatar image
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    )}
                    
                    {!avatarPreview && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground text-center">OR</p>
                        <Input
                          type="url"
                          placeholder="Or paste an avatar URL"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
            </Button>
          </form>

          <div className="text-center">
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                // Reset signup-specific fields when switching modes
                if (mode === "signup") {
                  setRegion("");
                  setBio("");
                  setAvatarUrl("");
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }
              }}
            >
              {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your location stays private — only civic authorities see exact coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
