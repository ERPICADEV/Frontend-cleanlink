import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showOTP, setShowOTP] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-md mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/landing")}
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
                ? "Let's get you inside."
                : "Start earning Civic Points today!"}
            </p>
          </div>

          {!showOTP ? (
            <div className="space-y-4">
              <Button variant="outline" className="w-full">
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-separator" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => setShowOTP(true)}
                >
                  Send OTP
                </Button>
              </div>

              <div className="text-center">
                <button
                  className="text-sm text-primary hover:underline"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                >
                  {mode === "login" ? "New? Sign up" : "Already have an account? Login"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => navigate("/")}
              >
                Verify & Continue
              </Button>
              <button
                className="text-sm text-muted-foreground hover:text-primary w-full"
                onClick={() => setShowOTP(false)}
              >
                Edit number
              </button>
            </div>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Your location stays private — only MCD sees exact coordinates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
