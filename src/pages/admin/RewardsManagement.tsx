import { useState } from "react";
import { Plus, Gift } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
        <Card className="border-none bg-gradient-to-r from-secondary to-background shadow-sm">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-semibold text-foreground md:text-2xl">
                  Rewards Management
                </h1>
              </div>
              <p className="max-w-xl text-sm text-muted-foreground">
                Create, edit, and manage rewards that residents can redeem with their civic points.
              </p>
            </div>
            <Button
              size="lg"
              className="hidden whitespace-nowrap rounded-full px-5 text-sm font-semibold md:inline-flex"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Reward
            </Button>
          </CardContent>
        </Card>

        {/* Mobile primary action */}
        <div className="md:hidden">
          <Button
            className="w-full rounded-full py-6 text-sm font-semibold"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Reward
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm">
            <CardContent className="py-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total Rewards
              </div>
              <div className="mt-2 text-3xl font-semibold">{rewards.length}</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="py-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Available Now
              </div>
              <div className="mt-2 text-3xl font-semibold">
              {rewards.filter((r) => {
                const now = new Date();
                const from = r.availableFrom ? new Date(r.availableFrom) : null;
                const until = r.availableUntil ? new Date(r.availableUntil) : null;
                if (from && now < from) return false;
                if (until && now > until) return false;
                return true;
              }).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="py-4">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Unavailable
              </div>
              <div className="mt-2 text-3xl font-semibold">
              {rewards.filter((r) => {
                const now = new Date();
                const from = r.availableFrom ? new Date(r.availableFrom) : null;
                const until = r.availableUntil ? new Date(r.availableUntil) : null;
                if (from && now < from) return true;
                if (until && now > until) return true;
                return false;
              }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} className="border-none shadow-sm">
                <CardContent className="py-4">
                  <Skeleton className="mb-2 h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-destructive">
            Failed to load rewards. Please try again later.
          </div>
        ) : rewards.length === 0 ? (
          <div className="space-y-6">
            <Card className="border-2 border-dashed border-muted bg-secondary/60 shadow-none">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Gift className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-lg font-semibold">No rewards</div>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Create your first reward to start rewarding residents for positive civic actions.
                </p>
                <Button
                  className="mt-4 rounded-full px-6"
                  size="sm"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Reward
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What are rewards?</CardTitle>
                <CardDescription>
                  Rewards are incentives you configure for residents to redeem with their civic
                  points.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">
                Use rewards to nudge the behaviors your city cares about most&mdash;like reporting
                issues, voting on priorities, or completing community tasks. They can be discounts,
                freebies, or special access provided by local partners.
              </CardContent>
            </Card>
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
