import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "../shared/EmptyState";
import type { Reward } from "@/types/rewards";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RewardsTableProps {
  rewards: Reward[];
  onEdit: (reward: Reward) => void;
  onDelete: (reward: Reward) => void;
  isLoading?: boolean;
}

export function RewardsTable({
  rewards,
  onEdit,
  onDelete,
  isLoading = false,
}: RewardsTableProps) {
  const isAvailable = (reward: Reward): boolean => {
    const now = new Date();
    const from = reward.availableFrom ? new Date(reward.availableFrom) : null;
    const until = reward.availableUntil ? new Date(reward.availableUntil) : null;

    if (from && now < from) return false;
    if (until && now > until) return false;
    return true;
  };

  if (rewards.length === 0) {
    return (
      <EmptyState
        title="No rewards found"
        description="Create your first reward to get started"
        icon="default"
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Table Header */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
        <div className="col-span-2">Title</div>
        <div className="col-span-1">Key</div>
        <div className="col-span-2">Description</div>
        <div className="col-span-1">Points</div>
        <div className="col-span-1">Max/User</div>
        <div className="col-span-2">Availability</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      {/* Table Body - Desktop View */}
      <div className="hidden lg:block divide-y divide-border">
        {rewards.map((reward) => {
          const available = isAvailable(reward);
          return (
            <div
              key={reward.id}
              className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="col-span-2">
                <div className="font-medium">{reward.title}</div>
              </div>
              <div className="col-span-1">
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                  {reward.key}
                </code>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reward.description}
                </p>
              </div>
              <div className="col-span-1">
                <span className="font-semibold text-primary">{reward.requiredPoints}</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm">{reward.maxPerUser}</span>
              </div>
              <div className="col-span-2">
                <div className="text-xs text-muted-foreground space-y-1">
                  {reward.availableFrom && (
                    <div>From: {new Date(reward.availableFrom).toLocaleDateString()}</div>
                  )}
                  {reward.availableUntil && (
                    <div>Until: {new Date(reward.availableUntil).toLocaleDateString()}</div>
                  )}
                  {!reward.availableFrom && !reward.availableUntil && (
                    <div>Always available</div>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <Badge variant={available ? "default" : "outline"}>
                  {available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Reward actions">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reward actions</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(reward)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(reward)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="lg:hidden divide-y divide-border">
        {rewards.map((reward) => {
          const available = isAvailable(reward);
          return (
            <div key={reward.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{reward.title}</h3>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono mt-1 inline-block">
                    {reward.key}
                  </code>
                </div>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Reward actions">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reward actions</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(reward)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(reward)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">{reward.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Points: </span>
                  <span className="font-semibold text-primary">{reward.requiredPoints}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Max/User: </span>
                  <span>{reward.maxPerUser}</span>
                </div>
                <Badge variant={available ? "default" : "outline"}>
                  {available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              {(reward.availableFrom || reward.availableUntil) && (
                <div className="text-xs text-muted-foreground space-y-1">
                  {reward.availableFrom && (
                    <div>From: {new Date(reward.availableFrom).toLocaleDateString()}</div>
                  )}
                  {reward.availableUntil && (
                    <div>Until: {new Date(reward.availableUntil).toLocaleDateString()}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
    </TooltipProvider>
  );
}
