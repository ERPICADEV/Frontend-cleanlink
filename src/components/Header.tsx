import { Search, Plus, User, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-separator">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">CL</span>
            </div>
            <span className="font-bold text-lg">CleanLink</span>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search problems, locations, solutions..."
              className="pl-10 h-9"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={() => navigate("/create-post")}
              className="hidden sm:flex"
            >
              <Plus className="w-4 h-4 mr-1" />
              Post Something
            </Button>
            <Button size="sm" variant="ghost">
              <LogIn className="w-4 h-4 mr-1" />
              Login
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
