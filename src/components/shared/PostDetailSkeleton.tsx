import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PostDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Header Skeleton */}
          <Card className="p-4 sm:p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
            <div className="flex items-center gap-4 pt-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </Card>

          {/* Description Skeleton */}
          <Card className="p-4 sm:p-6 space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </Card>

          {/* Comments Skeleton */}
          <Card className="p-4 sm:p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 pl-4 border-l-2 border-border">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}

