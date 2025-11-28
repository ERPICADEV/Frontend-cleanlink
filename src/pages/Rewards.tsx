import { Gift, Lock, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useRewards } from "@/hooks/useRewards";
import type { Reward } from "@/types/rewards";
import { Skeleton } from "@/components/ui/skeleton";

const getRewardIcon = (reward: Reward) => {
  const icon = reward.metadata?.icon as string | undefined;
  return icon || "🎁";
};

const Rewards = () => {
  const { user } = useAuth();
  const { rewards, loading, error, redeem, isRedeeming } = useRewards();
  const userPoints = user?.civicPoints ?? 0;

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

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-destructive">
            Failed to load rewards. Please try again later.
          </div>
        ) : !rewards.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No rewards are currently available. Check back soon!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {rewards.map((reward) => {
              const icon = getRewardIcon(reward);
              const canAfford = userPoints >= reward.requiredPoints;

              // Backend tracks per-user redemptions; frontend approximates "claimed"
              const isAvailableNow =
                (!reward.availableFrom || new Date(reward.availableFrom) <= new Date()) &&
                (!reward.availableUntil || new Date(reward.availableUntil) >= new Date());

              const isClaimable = canAfford && isAvailableNow;

              let statusLabel = "Available";
              let statusVariant: "default" | "outline" = "outline";

              if (!isAvailableNow) {
                statusLabel = "Unavailable";
              } else if (!canAfford) {
                statusLabel = "Insufficient Points";
              }

              return (
                <Card key={reward.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-5xl">{icon}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{reward.title}</h3>
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-semibold text-primary">
                            {reward.requiredPoints}
                          </span>
                          <span className="text-muted-foreground"> points</span>
                        </div>
                        {isClaimable ? (
                          <Button
                            size="sm"
                            disabled={isRedeeming}
                            onClick={() => redeem(reward.id)}
                          >
                            {isRedeeming ? "Claiming..." : "Claim Now"}
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            {canAfford ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Locked
                              </>
                            ) : (
                              <>Need {reward.requiredPoints - userPoints} more</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Rewards;
