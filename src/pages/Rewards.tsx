import { Gift, Lock, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  icon: string;
  unlocked: boolean;
  claimed: boolean;
}

const rewards: Reward[] = [
  {
    id: "1",
    title: "Solar Panel Subsidy",
    description: "Get 10% discount on solar panel installation",
    pointsRequired: 500,
    icon: "☀️",
    unlocked: false,
    claimed: false,
  },
  {
    id: "2",
    title: "Compost Kit",
    description: "Free home composting kit for organic waste",
    pointsRequired: 200,
    icon: "♻️",
    unlocked: true,
    claimed: false,
  },
  {
    id: "3",
    title: "Free Saplings",
    description: "Receive 5 native tree saplings for planting",
    pointsRequired: 150,
    icon: "🌱",
    unlocked: true,
    claimed: false,
  },
  {
    id: "4",
    title: "Rainwater Harvesting Discount",
    description: "15% off on rainwater harvesting system",
    pointsRequired: 400,
    icon: "💧",
    unlocked: true,
    claimed: false,
  },
  {
    id: "5",
    title: "Eco-Champion Badge",
    description: "Official recognition on your profile",
    pointsRequired: 300,
    icon: "🏆",
    unlocked: true,
    claimed: true,
  },
  {
    id: "6",
    title: "Public Transport Pass",
    description: "One month free public transport pass",
    pointsRequired: 600,
    icon: "🚌",
    unlocked: false,
    claimed: false,
  },
];

const Rewards = () => {
  const userPoints = 485;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Rewards & Perks</h1>
          </div>
          <p className="text-muted-foreground mb-4">
            Redeem your Civil Points for exclusive eco-friendly rewards
          </p>
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Points</p>
                <p className="text-2xl font-bold text-primary">{userPoints}</p>
              </div>
              <Gift className="w-12 h-12 text-primary/20" />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {rewards.map((reward) => {
            const canClaim = userPoints >= reward.pointsRequired && !reward.claimed;
            
            return (
              <Card
                key={reward.id}
                className={`p-6 ${
                  !reward.unlocked ? "opacity-60" : ""
                } ${reward.claimed ? "bg-accent/50" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{reward.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{reward.title}</h3>
                      {reward.claimed && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Claimed
                        </Badge>
                      )}
                      {!reward.unlocked && (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {reward.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-semibold text-primary">
                          {reward.pointsRequired}
                        </span>
                        <span className="text-muted-foreground"> points</span>
                      </div>
                      {reward.claimed ? (
                        <Badge variant="outline">Already Claimed</Badge>
                      ) : canClaim ? (
                        <Button size="sm">Claim Now</Button>
                      ) : reward.unlocked ? (
                        <Button size="sm" variant="outline" disabled>
                          Need {reward.pointsRequired - userPoints} more
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Lock className="w-4 h-4 mr-2" />
                          Locked
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Rewards;
