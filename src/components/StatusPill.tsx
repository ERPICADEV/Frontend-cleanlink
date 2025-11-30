import { cn } from "@/lib/utils";

const STATUS_META: Record<string, string> = {
  pending:
    "Pending|bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:border-amber-500/30",
  community_verified:
    "Community Verified|bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/30",
  assigned:
    "Assigned|bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-200 dark:border-violet-500/30",
  resolved:
    "Resolved|bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/30",
  flagged:
    "Flagged|bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-200 dark:border-red-500/30",
  duplicate:
    "Duplicate|bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-500/15 dark:text-slate-200 dark:border-slate-500/30",
};

const DEFAULT_META = {
  label: "Pending",
  classes:
    "bg-muted text-muted-foreground border-border dark:bg-muted/50 dark:text-foreground",
};

const parseMeta = (value: string | undefined) => {
  if (!value) return DEFAULT_META;
  const normalized = value.toLowerCase();
  const entry = STATUS_META[normalized];
  if (!entry) {
    return {
      ...DEFAULT_META,
      label: value
        .split(/[_-]/)
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(" "),
    };
  }
  const [label, classes] = entry.split("|");
  return { label, classes };
};

interface StatusPillProps {
  status?: string | null;
  className?: string;
}

const StatusPill = ({ status, className }: StatusPillProps) => {
  const meta = parseMeta(status ?? undefined);

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        meta.classes,
        className
      )}
    >
      {meta.label}
    </span>
  );
};

export default StatusPill;
