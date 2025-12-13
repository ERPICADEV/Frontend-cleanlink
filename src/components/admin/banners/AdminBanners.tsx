import { Shield, UserPlus, CheckCircle, ScrollText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { Report } from "@/types/admin";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminActionsBannerProps {
  report: Report;
  onAssign: () => void;
  onResolve: () => void;
  onViewAudit: () => void;
}

export function AdminActionsBanner({
  report,
  onAssign,
  onResolve,
  onViewAudit,
}: AdminActionsBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const isResolved = report.status === "resolved";

  return (
    <TooltipProvider>
      <div className="bg-admin-badge border border-admin-badge-border rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Label */}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-admin-badge-foreground" />
            <span className="font-semibold text-admin-badge-foreground">
              ADMIN ACTIONS
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAssign}
            disabled={isResolved}
            className="bg-card"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Assign Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onResolve}
            disabled={isResolved}
            className="bg-card"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Resolve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onViewAudit}
            className="bg-card"
          >
            <ScrollText className="w-4 h-4 mr-1.5" />
            View Audit
          </Button>

          {/* Dismiss */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDismissed(true)}
                className="ml-2 h-8 w-8"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dismiss</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
