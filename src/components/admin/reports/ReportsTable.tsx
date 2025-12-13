import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, UserPlus, CheckCircle, ScrollText, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  isLoading?: boolean;
  onResolve: (report: Report) => void;
  onViewAudit: (reportId: string) => void;
  showAssign?: boolean;
  showResolve?: boolean;
}

export function ReportsTable({
  reports,
  selectedIds,
  onSelectionChange,
  onAssign,
  onResolve,
  onViewAudit,
  showAssign = true,
  showResolve = true,
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
          <div className="col-span-1">Priority</div>
          <div className="col-span-1">Severity</div>
          <div className="col-span-2">Assigned To</div>
          <div className="col-span-1 -ml-10 text-left">Created</div>
          <div className="col-span-0 text-right">Actions</div>
        </div>

        {/* Table Body - Desktop View */}
        <div className="hidden lg:block divide-y divide-border">
          {reports.map((report) => (
            <div
              key={report.id}
              className={cn(
                "grid grid-cols-12 gap-4 px-4 py-4 table-row-hover",
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
              <div className="col-span-1 flex items-center min-w-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to={`/post/${report.id}`}
                      className="font-mono text-sm text-primary hover:underline truncate"
                    >
                      {report.id.slice(0, 8)}...
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono">{report.id}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Title */}
              <div className="col-span-2 flex items-center min-w-0">
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

              {/* Priority */}
              <div className="col-span-1 flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={cn(
                        report.priority_label === "Critical" && "bg-red-100 text-red-800 border-red-300",
                        report.priority_label === "High" && "bg-orange-100 text-orange-800 border-orange-300",
                        report.priority_label === "Normal" && "bg-gray-100 text-gray-800 border-gray-300"
                      )}
                    >
                      {report.priority_label === "Critical" && "🚨"}
                      {report.priority_label === "High" && "⚡"}
                      {report.priority_label === "Normal" && "🕒"}
                      {" "}
                      {report.priority_label || "Normal"}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Priority: {report.priority_label || "Normal"}
                      {report.priority_score !== undefined && ` (${Math.round(report.priority_score * 100)}%)`}
                      <br />
                      <span className="text-xs text-muted-foreground">Based on severity and legitimacy</span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Severity */}
              <div className="col-span-1 flex items-center">
                <SeverityIndicator
                  severity={report.severity}
                  confidence={report.aiScore?.legit}
                />
              </div>

              {/* Assigned To */}
              <div className="col-span-2 -ml-3 flex items-center text-sm min-w-0">
                {report.assignedToName ? (
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="font-medium truncate">{report.assignedToName}</span>
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAssign(report)}
                    disabled={report.status === "resolved"}
                    className="h-7 text-xs"
                  >
                    <UserPlus className="w-3 h-3 mr-1" />
                    Assign
                  </Button>
                )}
              </div>

              {/* Created */}
              <div className="col-span-1 -ml-12 items-center flex text-center">
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
                  {showResolve && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onResolve(report)}
                      disabled={report.status === "resolved"}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewAudit(report.id)}
                  >
                    <ScrollText className="w-4 h-4 mr-1" />
                    Audit
                  </Button>
                </div>

                {/* Tablet Actions Dropdown */}
                <div className="xl:hidden">
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Report actions">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Report actions</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end">
                      {showResolve && (
                        <DropdownMenuItem onClick={() => onResolve(report)} disabled={report.status === "resolved"}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve Report
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => onViewAudit(report.id)}>
                        <ScrollText className="w-4 h-4 mr-2" />
                        View Audit Log
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/post/${report.id}`}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-border">
          {reports.map((report) => (
            <div
              key={report.id}
              className={cn(
                "p-4 space-y-3",
                selectedIds.includes(report.id) && "bg-primary/5"
              )}
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Checkbox
                    checked={selectedIds.includes(report.id)}
                    onCheckedChange={() => toggleOne(report.id)}
                    className="shrink-0"
                  />
                  <Link
                    to={`/post/${report.id}`}
                    className="font-mono text-xs text-primary hover:underline truncate"
                  >
                    {report.id.slice(0, 12)}...
                  </Link>
                </div>
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0" aria-label="Report actions">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Report actions</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onResolve(report)} disabled={report.status === "resolved"}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewAudit(report.id)}>
                      <ScrollText className="w-4 h-4 mr-2" />
                      Audit Log
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/post/${report.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Title */}
              <div>
                <h3 className="font-semibold text-sm leading-tight line-clamp-2">{report.title}</h3>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={report.category} />
                <StatusBadge status={report.status} />
              </div>

              {/* Meta Row */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <SeverityIndicator
                      severity={report.severity}
                      confidence={report.aiScore?.legit}
                    />
                    <span className="whitespace-nowrap">
                      {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {report.assignedToName ? (
                    <span className="font-medium text-foreground truncate max-w-[120px]">
                      {report.assignedToName}
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      onClick={() => onAssign(report)}
                      disabled={report.status === "resolved"}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
