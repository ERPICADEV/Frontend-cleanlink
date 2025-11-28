import { MapPin, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatLocationName } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

const RegionSelector = () => {
  const { user } = useAuth();
  const { updateRegion, isUpdatingRegion } = useUserProfile();
  const { toast } = useToast();

  const currentRegionLabel = user?.region
    ? formatLocationName(user.region)
    : "Select region";

  const handleRegionSelect = async (city: string, state: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to change your region",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateRegion({
        region: {
          country: "India",
          state,
          city,
        },
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  // Hardcoded regions for now (can be fetched from API later)
  const regions = [
    { city: "New Delhi", state: "Delhi" },
    { city: "Mumbai", state: "Maharashtra" },
    { city: "Bangalore", state: "Karnataka" },
    { city: "Chennai", state: "Tamil Nadu" },
    { city: "Kolkata", state: "West Bengal" },
    { city: "Hyderabad", state: "Telangana" },
    { city: "Pune", state: "Maharashtra" },
    { city: "Ahmedabad", state: "Gujarat" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground gap-1"
          disabled={isUpdatingRegion}
        >
          <MapPin className="w-3.5 h-3.5" />
          {isUpdatingRegion ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <>
              <span className="truncate max-w-[100px]">{currentRegionLabel}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {regions.map((region) => (
          <DropdownMenuItem
            key={`${region.state}-${region.city}`}
            onClick={() => handleRegionSelect(region.city, region.state)}
            disabled={isUpdatingRegion}
          >
            {region.city}, {region.state}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RegionSelector;
