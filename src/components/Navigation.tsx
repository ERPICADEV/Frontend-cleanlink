import { Home, FileText, Gift, User } from "lucide-react";
import { NavLink } from "./NavLink";

const Navigation = () => {
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: FileText, label: "Report", path: "/report" },
    { icon: Gift, label: "Rewards", path: "/rewards" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img 
              src="/favicon.ico" 
              alt="CleanLink Logo" 
              className="w-8 h-8"
            />
            <span className="font-semibold text-lg">CleanLink</span>
          </div>

          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-primary"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
