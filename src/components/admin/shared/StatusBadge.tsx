import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/types/admin";

interface StatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

const statusConfig: Record<ReportStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-status-pending-bg text-status-pending border-status-pending/30",
  },
  assigned: {
    label: "Assigned",
    className: "bg-status-assigned-bg text-amber-800 border-status-assigned/30",
  },
  resolved: {
    label: "Resolved",
    className: "bg-status-resolved-bg text-green-800 border-status-resolved/30",
  },
  flagged: {
    label: "Flagged",
    className: "bg-status-flagged-bg text-red-800 border-status-flagged/30",
  },
  duplicate: {
    label: "Duplicate",
    className: "bg-status-duplicate-bg text-blue-800 border-status-duplicate/30",
  },
  invalid: {
    label: "Invalid",
    className: "bg-status-invalid-bg text-gray-800 border-status-invalid/30",
  },
  community_verified: {
    label: "Verified",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "status-badge",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
