import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import type { CreateRewardPayload } from "@/services/adminService";

interface CreateRewardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: CreateRewardPayload) => Promise<void>;
  isLoading?: boolean;
}

export function CreateRewardModal({
  open,
  onOpenChange,
  onCreate,
  isLoading: externalLoading = false,
}: CreateRewardModalProps) {
  const [formData, setFormData] = useState<CreateRewardPayload>({
    key: "",
    title: "",
    description: "",
    required_points: 0,
    available_from: null,
    available_until: null,
    max_per_user: 1,
    metadata: {},
  });
  const [error, setError] = useState("");
  const isLoading = externalLoading;

  const handleSubmit = async () => {
    setError("");

    // Validations
    if (!formData.key || !formData.title || !formData.description) {
      setError("Key, title, and description are required");
      return;
    }

    if (formData.required_points <= 0) {
      setError("Required points must be greater than 0");
      return;
    }

    if (formData.max_per_user < 1) {
      setError("Max per user must be at least 1");
      return;
    }

    try {
      await onCreate(formData);
      // Reset form
      setFormData({
        key: "",
        title: "",
        description: "",
        required_points: 0,
        available_from: null,
        available_until: null,
        max_per_user: 1,
        metadata: {},
      });
      onOpenChange(false);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleClose = () => {
    setFormData({
      key: "",
      title: "",
      description: "",
      required_points: 0,
      available_from: null,
      available_until: null,
      max_per_user: 1,
      metadata: {},
    });
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create New Reward
        </DialogTitle>
        <DialogDescription>
          Add a new reward that users can redeem with their civic points.
        </DialogDescription>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">
              Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="key"
              placeholder="e.g., eco-bag-2024"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this reward (lowercase, no spaces)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Eco-Friendly Tote Bag"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the reward..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="required_points">
                Required Points <span className="text-destructive">*</span>
              </Label>
              <Input
                id="required_points"
                type="number"
                min="1"
                value={formData.required_points || ""}
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
                value={formData.max_per_user || 1}
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
                  formData.available_from
                    ? new Date(formData.available_from).toISOString().slice(0, 16)
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
                  formData.available_until
                    ? new Date(formData.available_until).toISOString().slice(0, 16)
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
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Reward
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
