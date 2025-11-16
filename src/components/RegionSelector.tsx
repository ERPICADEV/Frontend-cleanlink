import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const RegionSelector = () => {
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const states = ["Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Rajasthan"];
  const cities: Record<string, string[]> = {
    Delhi: ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik"],
    Karnataka: ["Bangalore", "Mysore", "Mangalore"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
  };

  return (
    <div className="bg-accent/30 border-b border-separator py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-sm text-foreground font-medium">
            Choose your region to personalize your feed:
          </span>
          
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-32 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>

          <Select value={state} onValueChange={(val) => { setState(val); setCity(""); }}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {state && (
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-40 h-8 text-sm">
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities[state]?.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
