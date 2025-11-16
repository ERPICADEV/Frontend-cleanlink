import { cn } from "@/lib/utils";

type Status = "Pending" | "In Process" | "Resolved" | "Rejected";

interface StatusPillProps {
  status: Status;
  className?: string;
}

const StatusPill = ({ status, className }: StatusPillProps) => {
  const getStatusStyles = (status: Status) => {
    const styles = {
      Pending: "bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/20",
      "In Process": "bg-[hsl(var(--status-in-process))]/10 text-[hsl(var(--status-in-process))] border-[hsl(var(--status-in-process))]/20",
      Resolved: "bg-[hsl(var(--status-resolved))]/10 text-[hsl(var(--status-resolved))] border-[hsl(var(--status-resolved))]/20",
      Rejected: "bg-[hsl(var(--status-rejected))]/10 text-[hsl(var(--status-rejected))] border-[hsl(var(--status-rejected))]/20",
    };
    return styles[status];
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusPill;
