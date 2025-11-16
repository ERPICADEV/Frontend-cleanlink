import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

type BadgeLevel = "bronze" | "silver" | "gold";

interface CivicBadgeProps {
  level: BadgeLevel;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const CivicBadge = ({ level, size = "md", className }: CivicBadgeProps) => {
  const getBadgeColor = (level: BadgeLevel) => {
    const colors = {
      bronze: "text-[hsl(var(--civic-bronze))]",
      silver: "text-[hsl(var(--civic-silver))]",
      gold: "text-[hsl(var(--civic-gold))]",
    };
    return colors[level];
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <Award
      className={cn(sizeClasses[size], getBadgeColor(level), className)}
      fill="currentColor"
    />
  );
};

export default CivicBadge;
