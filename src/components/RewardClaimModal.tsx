import { useEffect, useState } from "react";
import { Gift, CheckCircle2 } from "lucide-react";
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
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

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
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        <div className="relative bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8 text-center">

          {/* Reward Icon */}
          <div className="mb-4 sm:mb-6 flex justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
              <div className="text-6xl sm:text-8xl animate-bounce">{icon}</div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 animate-scale-in" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-xl sm:text-2xl font-bold mb-2 animate-fade-in">
            Reward Claimed!
          </h2>
          <p className="text-base sm:text-lg font-semibold text-primary mb-1 animate-fade-in">
            {reward.title}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 animate-fade-in line-clamp-2">
            {reward.description}
          </p>

          {/* Points Info */}
          <div className="bg-card rounded-lg p-3 sm:p-4 mb-4 border border-border animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Points Deducted</span>
              <span className="text-base sm:text-lg font-bold text-destructive">
                -{pointsDeducted}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">New Balance</span>
              <span className="text-base sm:text-lg font-bold text-primary">
                {newBalance}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full animate-fade-in"
            disabled={isAnimating}
            size="sm"
          >
            <Gift className="w-4 h-4 mr-2" />
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
