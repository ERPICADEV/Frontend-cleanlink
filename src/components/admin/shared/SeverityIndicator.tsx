import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SeverityIndicatorProps {
  severity: number;
  confidence?: number;
  className?: string;
}

export function SeverityIndicator({ severity, confidence, className }: SeverityIndicatorProps) {
  const stars = Math.round(severity);
  
  const getStarColor = (index: number) => {
    if (index >= stars) return "text-gray-200";
    if (stars >= 5) return "text-severity-5";
    if (stars >= 4) return "text-severity-4";
    if (stars >= 3) return "text-severity-3";
    if (stars >= 2) return "text-severity-2";
    return "text-severity-1";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-0.5", className)}>
            {[1, 2, 3, 4, 5].map((index) => (
              <Star
                key={index}
                className={cn(
                  "w-4 h-4 transition-colors",
                  getStarColor(index),
                  index <= stars && "fill-current"
                )}
              />
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Severity: {severity}/5
            {confidence && ` (${Math.round(confidence * 100)}% confidence)`}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
