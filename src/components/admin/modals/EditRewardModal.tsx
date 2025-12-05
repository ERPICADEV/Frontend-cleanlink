import { useState, useEffect } from "react";
import { Edit, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Reward } from "@/types/rewards";
import type { UpdateRewardPayload } from "@/services/adminService";

interface EditRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  onUpdate: (rewardId: string, payload: UpdateRewardPayload) => Promise<void>;
  isLoading?: boolean;
}

export function EditRewardModal({
  open,
  onOpenChange,
  reward,
  onUpdate,
  isLoading: externalLoading = false,
}: EditRewardModalProps) {
  const [formData, setFormData] = useState<UpdateRewardPayload>({});
  const [error, setError] = useState("");
  const isLoading = externalLoading;

  useEffect(() => {
    if (reward) {
      setFormData({
        title: reward.title,
        description: reward.description,
        required_points: reward.requiredPoints,
        max_per_user: reward.maxPerUser,
        available_from: reward.availableFrom || null,
        available_until: reward.availableUntil || null,
        metadata: reward.metadata || {},
      });
    }
  }, [reward]);

  const handleSubmit = async () => {
    if (!reward) return;

    setError("");

    // Validations
    if (formData.title !== undefined && !formData.title) {
      setError("Title is required");
      return;
    }

    if (formData.description !== undefined && !formData.description) {
      setError("Description is required");
      return;
    }

    if (formData.required_points !== undefined && formData.required_points <= 0) {
      setError("Required points must be greater than 0");
      return;
    }

    if (formData.max_per_user !== undefined && formData.max_per_user < 1) {
      setError("Max per user must be at least 1");
      return;
    }

    try {
      await onUpdate(reward.id, formData);
      onOpenChange(false);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleClose = () => {
    setFormData({});
    setError("");
    onOpenChange(false);
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          Edit Reward
        </DialogTitle>
        <DialogDescription>
          Update the reward details. Leave fields empty to keep current values.
        </DialogDescription>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Reward ID:</span>
              <code className="bg-card px-2 py-0.5 rounded text-xs font-mono">
                {reward.id.slice(0, 12)}...
              </code>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Key:</span>
              <code className="bg-card px-2 py-0.5 rounded text-xs font-mono">
                {reward.key}
              </code>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Eco-Friendly Tote Bag"
              value={formData.title || reward.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the reward..."
              value={formData.description || reward.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="required_points">Required Points</Label>
              <Input
                id="required_points"
                type="number"
                min="1"
                value={formData.required_points !== undefined ? formData.required_points : reward.requiredPoints}
                onChange={(e) =>
                  setFormData({ ...formData, required_points: parseInt(e.target.value) || 0 })
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_per_user">Max Per User</Label>
              <Input
                id="max_per_user"
                type="number"
                min="1"
                value={formData.max_per_user !== undefined ? formData.max_per_user : reward.maxPerUser}
                onChange={(e) =>
                  setFormData({ ...formData, max_per_user: parseInt(e.target.value) || 1 })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="available_from">Available From (Optional)</Label>
              <Input
                id="available_from"
                type="datetime-local"
                value={
                  formData.available_from !== undefined
                    ? formData.available_from
                      ? new Date(formData.available_from).toISOString().slice(0, 16)
                      : ""
                    : reward.availableFrom
                    ? new Date(reward.availableFrom).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    available_from: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="available_until">Available Until (Optional)</Label>
              <Input
                id="available_until"
                type="datetime-local"
                value={
                  formData.available_until !== undefined
                    ? formData.available_until
                      ? new Date(formData.available_until).toISOString().slice(0, 16)
                      : ""
                    : reward.availableUntil
                    ? new Date(reward.availableUntil).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    available_until: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                disabled={isLoading}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Update Reward
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
