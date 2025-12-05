import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Reward } from "@/types/rewards";

interface DeleteRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  onDelete: (rewardId: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeleteRewardModal({
  open,
  onOpenChange,
  reward,
  onDelete,
  isLoading: externalLoading = false,
}: DeleteRewardModalProps) {
  const isLoading = externalLoading;

  const handleDelete = async () => {
    if (!reward) return;
    try {
      await onDelete(reward.id);
      onOpenChange(false);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          Delete Reward
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this reward? This action cannot be undone.
        </DialogDescription>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Reward ID:</span>
            <code className="bg-card px-2 py-0.5 rounded text-xs font-mono">
              {reward.id.slice(0, 12)}...
            </code>
          </div>
          <p className="font-medium">{reward.title}</p>
          <p className="text-sm text-muted-foreground">{reward.description}</p>
          <div className="text-sm">
            <span className="text-muted-foreground">Required Points: </span>
            <span className="font-semibold">{reward.requiredPoints}</span>
          </div>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">
            <strong>Warning:</strong> This will permanently delete the reward. Users who have
            already redeemed this reward will not be affected, but the reward will no longer be
            available for new redemptions.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Reward
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
