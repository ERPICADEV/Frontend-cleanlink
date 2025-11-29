import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, UserPlus, CheckCircle, ScrollText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusBadge } from "../shared/StatusBadge";
import { CategoryBadge } from "../shared/CategoryBadge";
import { SeverityIndicator } from "../shared/SeverityIndicator";
import { EmptyState } from "../shared/EmptyState";
import type { Report } from "@/types/admin";
import { cn } from "@/lib/utils";

interface ReportsTableProps {
  reports: Report[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onAssign: (report: Report) => void;
  onResolve: (report: Report) => void;
  onViewAudit: (reportId: string) => void;
}

export function ReportsTable({
  reports,
  selectedIds,
  onSelectionChange,
  onAssign,
  onResolve,
  onViewAudit,
}: ReportsTableProps) {
  const allSelected = reports.length > 0 && selectedIds.length === reports.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < reports.length;

  const toggleAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(reports.map((r) => r.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  if (reports.length === 0) {
    return (
      <EmptyState
        title="No reports found"
        description="Try adjusting your search or filter criteria"
        icon="search"
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border text-sm font-medium text-muted-foreground">
          <div className="col-span-1 flex items-center">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              className={cn(someSelected && "data-[state=checked]:bg-primary/50")}
            />
          </div>
          <div className="col-span-1">ID</div>
          <div className="col-span-2">Title</div>
          <div className="col-span-1">Category</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Severity</div>
          <div className="col-span-2">Assigned To</div>
          <div className="col-span-1">Created</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {reports.map((report) => (
            <div
              key={report.id}
              className={cn(
                "grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-4 px-4 py-4 table-row-hover",
                selectedIds.includes(report.id) && "bg-primary/5"
              )}
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center">
                <Checkbox
                  checked={selectedIds.includes(report.id)}
                  onCheckedChange={() => toggleOne(report.id)}
                />
              </div>

              {/* ID */}
              <div className="col-span-1 flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`/reports/${report.id}`}
                      className="font-mono text-sm text-primary hover:underline truncate"
                    >
                      {report.id.slice(0, 8)}...
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono">{report.id}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Title */}
              <div className="col-span-2 flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-medium truncate">{report.title}</span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{report.title}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Category */}
              <div className="col-span-1 flex items-center">
                <CategoryBadge category={report.category} />
              </div>

              {/* Status */}
              <div className="col-span-1 flex items-center">
                <StatusBadge status={report.status} />
              </div>

              {/* Severity */}
              <div className="col-span-1 flex items-center">
                <SeverityIndicator
                  severity={report.severity}
                  confidence={report.aiScore?.legit}
                />
              </div>

              {/* Assigned To */}
              <div className="col-span-2 flex items-center text-sm">
                {report.assignedToName ? (
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium">{report.assignedToName}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {report.region}
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>

              {/* Created */}
              <div className="col-span-1 flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{new Date(report.createdAt).toLocaleString()}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                {/* Desktop Actions */}
                <div className="hidden xl:flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssign(report)}
                    disabled={report.status === "resolved"}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    Assign
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResolve(report)}
                    disabled={report.status === "resolved"}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewAudit(report.id)}
                  >
                    <ScrollText className="w-4 h-4 mr-1" />
                    Audit
                  </Button>
                </div>

                {/* Mobile/Tablet Actions Dropdown */}
                <div className="xl:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAssign(report)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onResolve(report)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolve Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewAudit(report.id)}>
                        <ScrollText className="w-4 h-4 mr-2" />
                        View Audit Log
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
