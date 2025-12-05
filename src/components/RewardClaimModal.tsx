import { useEffect, useState } from "react";
import { Gift, CheckCircle2, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Reward } from "@/types/rewards";

interface RewardClaimModalProps {
  open: boolean;
  onClose: () => void;
  reward: Reward | null;
  pointsDeducted: number;
  newBalance: number;
}

export function RewardClaimModal({
  open,
  onClose,
  reward,
  pointsDeducted,
  newBalance,
}: RewardClaimModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open && reward) {
      setIsAnimating(true);
      
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Auto-close after animation
      const timer = setTimeout(() => {
        setIsAnimating(false);
        onClose();
      }, 3500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [open, reward, onClose]);

  if (!reward) return null;

  const icon = reward.metadata?.icon as string | undefined || "🎁";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-background p-8 text-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Reward Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="text-8xl animate-bounce">{icon}</div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 animate-scale-in" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold mb-2 animate-fade-in">
            Reward Claimed!
          </h2>
          <p className="text-lg font-semibold text-primary mb-1 animate-fade-in">
            {reward.title}
          </p>
          <p className="text-sm text-muted-foreground mb-6 animate-fade-in">
            {reward.description}
          </p>

          {/* Points Info */}
          <div className="bg-card rounded-lg p-4 mb-4 border border-border animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Points Deducted</span>
              <span className="text-lg font-bold text-destructive">
                -{pointsDeducted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Balance</span>
              <span className="text-lg font-bold text-primary">
                {newBalance}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full animate-fade-in"
            disabled={isAnimating}
          >
            <Gift className="w-4 h-4 mr-2" />
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
