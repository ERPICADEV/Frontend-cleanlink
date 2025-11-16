import { TrendingUp, ArrowUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TrendingItem {
  id: string;
  title: string;
  upvotes: number;
}

const TrendingSidebar = () => {
  const localTrending: TrendingItem[] = [
    { id: "1", title: "Major Garbage Pile Near Rohini Sector 11", upvotes: 245 },
    { id: "2", title: "Broken Water Pipeline in Lajpat Nagar", upvotes: 189 },
    { id: "3", title: "Power Outage in Dwarka Sector 10", upvotes: 156 },
    { id: "4", title: "Road Damage on NH-8", upvotes: 134 },
    { id: "5", title: "Tree Fall Risk Near School", upvotes: 98 },
  ];

  const indiaTrending: TrendingItem[] = [
    { id: "6", title: "Water Crisis in Chennai", upvotes: 1240 },
    { id: "7", title: "Traffic Issues in Bangalore", upvotes: 890 },
    { id: "8", title: "Garbage Management in Mumbai", upvotes: 756 },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Trending in Your Area</h3>
        </div>
        <div className="space-y-2">
          {localTrending.map((item) => (
            <div key={item.id} className="flex gap-2 py-1 hover:bg-accent/50 cursor-pointer rounded px-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <ArrowUp className="w-3 h-3" />
                <span className="text-xs font-medium">{item.upvotes}</span>
              </div>
              <p className="text-xs text-foreground flex-1">{item.title}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Trending in India</h3>
        </div>
        <div className="space-y-2">
          {indiaTrending.map((item) => (
            <div key={item.id} className="flex gap-2 py-1 hover:bg-accent/50 cursor-pointer rounded px-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <ArrowUp className="w-3 h-3" />
                <span className="text-xs font-medium">{item.upvotes}</span>
              </div>
              <p className="text-xs text-foreground flex-1">{item.title}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TrendingSidebar;
