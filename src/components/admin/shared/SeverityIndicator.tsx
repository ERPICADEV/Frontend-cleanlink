import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SeverityIndicatorProps {
  severity?: number;
  confidence?: number;
  className?: string;
}

export function SeverityIndicator({ severity, confidence, className }: SeverityIndicatorProps) {
  // Calculate severity percentage (severity is 1-5, convert to 0-100%)
  const severityPercent = severity ? Math.round((severity / 5) * 100) : 0;
  
  const getSeverityColor = () => {
    if (!severity) return "text-muted-foreground";
    if (severity >= 4.5) return "text-destructive font-semibold";
    if (severity >= 3.5) return "text-orange-500 font-semibold";
    if (severity >= 2.5) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center", className)}>
            <span className={cn("text-sm font-medium", getSeverityColor())}>
              {severity ? `${severityPercent}%` : "N/A"}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Severity: {severity ? `${severity}/5 (${severityPercent}%)` : "Not available"}
            {confidence && ` • Confidence: ${Math.round(confidence * 100)}%`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
