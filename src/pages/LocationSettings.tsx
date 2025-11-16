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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const LocationSettings = () => {
  const [state, setState] = useState("Delhi");
  const [city, setCity] = useState("Central Delhi");
  const [showCityOnly, setShowCityOnly] = useState(false);
  const [showNearby, setShowNearby] = useState(true);
  const [showIndia, setShowIndia] = useState(true);
  const { toast } = useToast();

  const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Rajasthan"];
  const cities: Record<string, string[]> = {
    Delhi: ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Karnataka: ["Bangalore", "Mysore", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your location preferences have been updated",
    });
  };

  const handleAutoDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          toast({
            title: "Location detected",
            description: "Your location has been automatically set",
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
          <h2 className="font-semibold mb-4">Set Your Location</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={state} onValueChange={(val) => { setState(val); setCity(""); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cities[state]?.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" onClick={handleAutoDetect} className="w-full">
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

        <Button onClick={handleSave} className="w-full">
          Save Preferences
        </Button>
      </main>
    </div>
  );
};

export default LocationSettings;
