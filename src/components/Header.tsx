import { Search, Plus, Bell, User, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "@/components/ProfileMenu";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const navigate = useNavigate();

  // Mock user data - replace with actual auth context
  const user = {
    username: "Rahul Kumar",
    region: "South Delhi, Delhi",
    points: 485,
    level: "Active Contributor",
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-separator">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">CleanLink</span>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search problems, locations, solutions..."
              className="pl-10 h-9"
              onClick={() => navigate("/search")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => navigate("/create-post")}
              className="hidden md:flex"
            >
              <Plus className="w-4 h-4 mr-1" />
              Report
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="relative hidden md:flex"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive">
                3
              </Badge>
            </Button>

            <ProfileMenu
              username={user.username}
              region={user.region}
              points={user.points}
              level={user.level}
            >
              <Button size="sm" variant="ghost" className="hidden md:flex">
                <User className="w-4 h-4" />
              </Button>
            </ProfileMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
