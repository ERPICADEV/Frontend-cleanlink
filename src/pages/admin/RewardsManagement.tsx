import { useState } from "react";
import { Plus, Loader2, Gift } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminRewards } from "@/hooks/useAdminRewards";
import { RewardsTable } from "@/components/admin/rewards/RewardsTable";
import { CreateRewardModal } from "@/components/admin/modals/CreateRewardModal";
import { EditRewardModal } from "@/components/admin/modals/EditRewardModal";
import { DeleteRewardModal } from "@/components/admin/modals/DeleteRewardModal";
import type { Reward } from "@/types/rewards";

export default function RewardsManagement() {
  const {
    rewards,
    loading,
    error,
    createReward,
    updateReward,
    deleteReward,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAdminRewards();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const handleCreate = async (payload: any) => {
    await createReward(payload);
  };

  const handleEdit = (reward: Reward) => {
    setSelectedReward(reward);
    setEditModalOpen(true);
  };

  const handleUpdate = async (rewardId: string, payload: any) => {
    await updateReward(rewardId, payload);
    setEditModalOpen(false);
    setSelectedReward(null);
  };

  const handleDelete = (reward: Reward) => {
    setSelectedReward(reward);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (rewardId: string) => {
    await deleteReward(rewardId);
    setDeleteModalOpen(false);
    setSelectedReward(null);
  };

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Rewards Management" },
      ]}
    >
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Rewards Management</h1>
            </div>
            <p className="text-muted-foreground">
              Create, edit, and manage rewards that users can redeem with their civic points
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Reward
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Rewards</div>
            <div className="text-2xl font-bold">{rewards.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Available Now</div>
            <div className="text-2xl font-bold">
              {rewards.filter((r) => {
                const now = new Date();
                const from = r.availableFrom ? new Date(r.availableFrom) : null;
                const until = r.availableUntil ? new Date(r.availableUntil) : null;
                if (from && now < from) return false;
                if (until && now > until) return false;
                return true;
              }).length}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">Unavailable</div>
            <div className="text-2xl font-bold">
              {rewards.filter((r) => {
                const now = new Date();
                const from = r.availableFrom ? new Date(r.availableFrom) : null;
                const until = r.availableUntil ? new Date(r.availableUntil) : null;
                if (from && now < from) return true;
                if (until && now > until) return true;
                return false;
              }).length}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">
            Failed to load rewards. Please try again later.
          </div>
        ) : (
          <RewardsTable
            rewards={rewards}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isDeleting}
          />
        )}

        {/* Modals */}
        <CreateRewardModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onCreate={handleCreate}
          isLoading={isCreating}
        />

        <EditRewardModal
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open);
            if (!open) setSelectedReward(null);
          }}
          reward={selectedReward}
          onUpdate={handleUpdate}
          isLoading={isUpdating}
        />

        <DeleteRewardModal
          open={deleteModalOpen}
          onOpenChange={(open) => {
            setDeleteModalOpen(open);
            if (!open) setSelectedReward(null);
          }}
          reward={selectedReward}
          onDelete={handleConfirmDelete}
          isLoading={isDeleting}
        />
      </div>
    </AdminLayout>
  );
}
