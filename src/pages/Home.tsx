import { useMemo, useState } from "react";
import Header from "@/components/Header";
import RegionSelector from "@/components/RegionSelector";
import PostRow from "@/components/PostRow";
import TrendingSidebar from "@/components/TrendingSidebar";
import BottomNav from "@/components/BottomNav";
import FloatingActionButton from "@/components/FloatingActionButton";
import FirstTimeTooltip from "@/components/FirstTimeTooltip";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useReports } from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import MapExplorer from "@/components/MapExplorer";

const categories = ["All", "Garbage", "Road", "Water", "Trees", "Electricity", "Other"];

const FeedSkeleton = () => (
  <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden divide-y divide-border">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="p-4 flex gap-3 animate-pulse">
        <div className="w-10 flex flex-col gap-2 items-center">
          <div className="w-6 h-6 bg-muted rounded" />
          <div className="w-6 h-6 bg-muted rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
        <div className="w-20 h-20 bg-muted rounded-lg" />
      </div>
    ))}
  </div>
);

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const categoryFilter = useMemo(
    () => (selectedCategory === "All" ? undefined : selectedCategory),
    [selectedCategory]
  );

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    error,
  } = useReports({
    category: categoryFilter,
    limit: 10,
  });

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <FirstTimeTooltip />
      <Header />
      
      {/* Region Strip - Clean & Minimal */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between">
          <RegionSelector />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
            <button
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={() => refetch()}
            >
              <RefreshCcw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4 md:flex md:gap-6">
        {/* Main Feed */}
        <div className="flex-1 max-w-3xl mx-auto">
          <MapExplorer
            category={selectedCategory}
            onSelectReport={(id) => navigate(`/post/${id}`)}
          />

          {/* Category Filters - Horizontal Scroll */}
          <div className="flex gap-2 mb-0 sm:mb-4 overflow-x-auto pb-2 pt-3 px-3 sm:px-0 scrollbar-hide border-b border-border bg-card sm:bg-transparent sm:border-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation flex-shrink-0",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-4 text-sm">
                Failed to load reports. Please try again.
              </div>
            )}

            {isLoading ? (
              <FeedSkeleton />
            ) : (
              <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostRow
                      key={post.id}
                      post={post}
                      onClick={() => navigate(`/post/${post.id}`)}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 px-4">
                    <p className="text-muted-foreground mb-2 font-medium">No reports here yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to report in your area!
                    </p>
                  </div>
                )}
              </div>
            )}

            {hasNextPage && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading more…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Trending Sidebar - Desktop */}
        <div className="hidden md:block w-80 flex-shrink-0">
          <TrendingSidebar />
        </div>
      </div>

      {/* FAB */}
      <FloatingActionButton />

      {/* Bottom Navigation - Mobile */}
      <BottomNav />
    </div>
  );
};

export default Home;
