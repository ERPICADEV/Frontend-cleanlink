import { cn } from "@/lib/utils";
import type { ReportCategory } from "@/types/admin";
import { 
  CircleDot, 
  Trash2, 
  Droplets, 
  Wrench, 
  TrafficCone, 
  MoreHorizontal 
} from "lucide-react";

interface CategoryBadgeProps {
  category: ReportCategory;
  className?: string;
  showIcon?: boolean;
}

const categoryConfig: Record<ReportCategory, { 
  label: string; 
  className: string;
  icon: typeof CircleDot;
}> = {
  pothole: {
    label: "Pothole",
    className: "bg-red-100 text-red-800 border-red-200",
    icon: CircleDot,
  },
  garbage: {
    label: "Garbage",
    className: "bg-green-100 text-green-800 border-green-200",
    icon: Trash2,
  },
  flooding: {
    label: "Flooding",
    className: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Droplets,
  },
  street_maintenance: {
    label: "Street Maintenance",
    className: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Wrench,
  },
  traffic: {
    label: "Traffic",
    className: "bg-orange-100 text-orange-800 border-orange-200",
    icon: TrafficCone,
  },
  other: {
    label: "Others",
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: MoreHorizontal,
  },
};

export function CategoryBadge({ category, className, showIcon = true }: CategoryBadgeProps) {
  // Handle unknown categories gracefully
  const config = categoryConfig[category] || categoryConfig.other;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "status-badge",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
}
