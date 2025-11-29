import { format } from "date-fns";
import { 
  Plus, 
  Edit, 
  UserPlus, 
  CheckCircle, 
  Flag,
  Bot,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditLog, ActionType } from "@/types/admin";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AuditTimelineProps {
  logs: AuditLog[];
}

const actionConfig: Record<ActionType, { icon: typeof Plus; color: string; bgColor: string }> = {
  created: { icon: Plus, color: "text-blue-600", bgColor: "bg-blue-100" },
  updated: { icon: Edit, color: "text-amber-600", bgColor: "bg-amber-100" },
  assigned: { icon: UserPlus, color: "text-green-600", bgColor: "bg-green-100" },
  resolved: { icon: CheckCircle, color: "text-purple-600", bgColor: "bg-purple-100" },
  flagged: { icon: Flag, color: "text-red-600", bgColor: "bg-red-100" },
  duplicate: { icon: Flag, color: "text-orange-600", bgColor: "bg-orange-100" },
};

function ChangeItem({ field, before, after }: { field: string; before: unknown; after: unknown }) {
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  };

  return (
    <li className="text-sm">
      <span className="font-medium text-foreground">{field}:</span>{" "}
      <span className="text-muted-foreground line-through">{formatValue(before)}</span>
      {" → "}
      <span className="text-foreground">{formatValue(after)}</span>
    </li>
  );
}

function TimelineEvent({ log, isLast }: { log: AuditLog; isLast: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = actionConfig[log.actionType];
  const Icon = config.icon;
  const isSystem = log.actor.toLowerCase().includes("system") || log.actor.toLowerCase().includes("bot");
  const changes = Object.entries(log.changes);

  return (
    <div className="relative pl-10">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-border" />
      )}

      {/* Timeline Dot */}
      <div
        className={cn(
          "absolute left-1.5 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background",
          config.bgColor
        )}
      >
        <Icon className={cn("w-3 h-3", config.color)} />
      </div>

      {/* Event Content */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full text-left">
          <div className="bg-card border border-border rounded-lg p-4 mb-4 hover:shadow-sm transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold capitalize", config.color)}>
                    {log.actionType}
                  </span>
                  {isSystem && (
                    <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded">
                      <Bot className="w-3 h-3" />
                      System
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isSystem ? "System" : log.actor}
                  {log.actorRole && ` (${log.actorRole})`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <time className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
                </time>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </div>

            {/* Quick Preview */}
            {!isOpen && changes.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2 truncate">
                {changes.length} change{changes.length !== 1 ? "s" : ""}
                {log.details && `: ${log.details.slice(0, 50)}...`}
              </p>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="bg-muted/30 border border-border border-t-0 rounded-b-lg -mt-4 mb-4 p-4 pt-6 ml-4">
            {/* Changes List */}
            {changes.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Changes:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  {changes.map(([field, { before, after }]) => (
                    <ChangeItem key={field} field={field} before={before} after={after} />
                  ))}
                </ul>
              </div>
            )}

            {/* Details */}
            {log.details && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-1">Details:</p>
                <p className="text-sm text-foreground">{log.details}</p>
              </div>
            )}

            {/* Photos */}
            {log.photos && log.photos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-2">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {log.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground"
                    >
                      Photo {index + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No audit logs available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => (
        <TimelineEvent
          key={log.id}
          log={log}
          isLast={index === logs.length - 1}
        />
      ))}
    </div>
  );
}
