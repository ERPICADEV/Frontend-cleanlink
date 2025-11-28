import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useRegions } from "@/hooks/useRegions";
import { Loader2 } from "lucide-react";
import { formatLocationName } from "@/lib/formatters";

const LocationSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const { updateRegion, isUpdatingRegion } = useUserProfile();
  const { data: regionsData, isLoading: isLoadingRegions } = useRegions();
  const { toast } = useToast();

  // Initialize from user's current region
  const currentRegion = user?.region;
  const [country, setCountry] = useState("India");
  const [state, setState] = useState(
    (currentRegion as any)?.state || "Delhi"
  );
  const [city, setCity] = useState(
    (currentRegion as any)?.city || ""
  );
  const [showCityOnly, setShowCityOnly] = useState(false);
  const [showNearby, setShowNearby] = useState(true);
  const [showIndia, setShowIndia] = useState(true);

  // Extract states and cities from regions data
  const availableStates = useMemo(() => {
    if (!regionsData?.countries) return [];
    const india = regionsData.countries.find((c) => c.name === "India");
    return india?.states || [];
  }, [regionsData]);

  const availableCities = useMemo(() => {
    const selectedState = availableStates.find((s) => s.name === state);
    return selectedState?.cities || [];
  }, [availableStates, state]);

  // Update city when state changes
  useEffect(() => {
    if (availableCities.length > 0 && !availableCities.includes(city)) {
      setCity(availableCities[0]);
    }
  }, [state, availableCities, city]);

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to update your region",
        variant: "destructive",
      });
      return;
    }

    if (!city || !state) {
      toast({
        title: "Missing information",
        description: "Please select both state and city",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateRegion({
        region: {
          country,
          state,
          city,
        },
      });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For now, just show a toast. In production, you'd reverse geocode
          // the coordinates to get city/state
          toast({
            title: "Location detected",
            description: "Please select your city and state manually",
          });
        },
        () => {
          toast({
            title: "Location error",
            description: "Please enable location access",
            variant: "destructive",
          });
        }
      );
    }
  };

  const currentRegionLabel = currentRegion
    ? formatLocationName(currentRegion)
    : "Not set";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Location Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Customize your feed based on your location
          </p>
        </div>

        <Card className="p-6 mb-4">
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Current Location</h2>
            <p className="text-sm text-muted-foreground">{currentRegionLabel}</p>
          </div>

          <h2 className="font-semibold mb-4">Set Your Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select
                value={state}
                onValueChange={(val) => {
                  setState(val);
                  setCity("");
                }}
                disabled={isLoadingRegions || isUpdatingRegion}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingRegions ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    availableStates.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select
                value={city}
                onValueChange={setCity}
                disabled={isLoadingRegions || isUpdatingRegion || !state}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Select a state first
                    </SelectItem>
                  ) : (
                    availableCities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={handleAutoDetect}
              className="w-full"
              disabled={isUpdatingRegion}
            >
              Auto-detect Location
            </Button>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4">Feed Preferences</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="city-only"
                checked={showCityOnly}
                onCheckedChange={(checked) => setShowCityOnly(checked as boolean)}
              />
              <label
                htmlFor="city-only"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show only posts from my city
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="nearby"
                checked={showNearby}
                onCheckedChange={(checked) => setShowNearby(checked as boolean)}
              />
              <label
                htmlFor="nearby"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show nearby district posts
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="india"
                checked={showIndia}
                onCheckedChange={(checked) => setShowIndia(checked as boolean)}
              />
              <label
                htmlFor="india"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Show India-wide issues
              </label>
            </div>
          </div>
        </Card>

        <Button
          onClick={handleSave}
          className="w-full"
          disabled={isUpdatingRegion || !city || !state}
        >
          {isUpdatingRegion ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Location"
          )}
        </Button>
      </main>
    </div>
  );
};

export default LocationSettings;
