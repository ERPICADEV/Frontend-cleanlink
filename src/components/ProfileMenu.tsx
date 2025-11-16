import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User, Award, FileText, Settings, HelpCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProfileMenuProps {
  children: React.ReactNode;
  points: number;
  level: string;
  username: string;
  region: string;
}

const ProfileMenu = ({
  children,
  points,
  level,
  username,
  region,
}: ProfileMenuProps) => {
  const navigate = useNavigate();
  const progressToNext = (points % 200) / 2; // Simple calculation for demo

  const menuItems = [
    { icon: User, label: "View Profile", path: "/profile" },
    { icon: Award, label: "Civic Sense & Rewards", path: "/rewards" },
    { icon: FileText, label: "My Reports", path: "/profile" },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help & FAQ", path: "/help" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh]">
        <SheetHeader>
          <SheetTitle className="sr-only">Profile Menu</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 py-4">
          {/* Profile Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{username}</h3>
                <p className="text-sm text-muted-foreground">{region}</p>
              </div>
            </div>

            {/* Civic Points */}
            <div className="bg-accent/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Civic Points</span>
                <span className="text-2xl font-bold text-primary">{points}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{level}</span>
                  <span>Next: {200 - (points % 200)} pts</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Logout */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => navigate("/logout")}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileMenu;
