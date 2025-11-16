import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="space-y-3">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <MapPin className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold">CleanLink</h1>
          <p className="text-lg text-muted-foreground">
            Connect citizens to cleaner cities
          </p>
        </div>

        {/* Description */}
        <div className="bg-accent/30 rounded-lg p-6 space-y-2">
          <p className="text-sm text-foreground">
            Report local problems, earn Civic Points, and make your community better.
          </p>
          <p className="text-xs text-muted-foreground">
            Join thousands of citizens working together for cleaner cities across India.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Sign Up / Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => navigate("/")}
          >
            Continue as Guest
          </Button>
        </div>

        {/* Region Prompt */}
        <div className="pt-4">
          <p className="text-xs text-muted-foreground">
            Choose your region after login to personalize your feed
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
