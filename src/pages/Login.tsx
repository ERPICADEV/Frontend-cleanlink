import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { isAxiosError } from "axios";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
        toast({ title: "Welcome back!" });
      } else {
        await signup({ email, password, username });
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
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
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
