import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ReportCardSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
    </Card>
  );
}

export function ReportsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/50 border-b border-border">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24 ml-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* Mobile Card Skeleton */}
      <div className="lg:hidden divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <ReportCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

