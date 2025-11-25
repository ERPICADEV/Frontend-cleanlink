import { useState } from "react";
import Header from "@/components/Header";
import PostRow from "@/components/PostRow";
import BottomNav from "@/components/BottomNav";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TrendingUp, MapPin, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchReports } from "@/services/reportService";

const PopularProblems = () => {
  const [view, setView] = useState<"local" | "trending">("local");
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["popular", view],
    queryFn: () =>
      fetchReports({
        sort: view === "local" ? "hot" : "top",
        limit: 25,
      }),
    keepPreviousData: true,
  });

  const posts = data?.data ?? [];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />
      
      {/* View Toggle */}
      <div className="border-b border-border bg-card sticky top-12 z-40">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex gap-0 py-2">
            <button
              onClick={() => setView("local")}
              className={cn(
                "flex-1 py-2.5 px-4 text-sm font-medium transition-all rounded-lg flex items-center justify-center gap-2",
                view === "local"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MapPin className="w-4 h-4" />
              Popular in Your Area
            </button>
            <button
              onClick={() => setView("trending")}
              className={cn(
                "flex-1 py-2.5 px-4 text-sm font-medium transition-all rounded-lg flex items-center justify-center gap-2",
                view === "trending"
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Trending in India
            </button>
          </div>
          <div className="flex items-center justify-end gap-2 pb-2 text-xs text-muted-foreground">
            {isFetching && <Loader2 className="w-3 h-3 animate-spin" />}
            <button className="hover:text-foreground transition-colors" onClick={() => refetch()}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="max-w-3xl mx-auto">
          {/* Posts Feed */}
          <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden">
            {isLoading ? (
              <div className="p-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading popular issues…
              </div>
            ) : posts.length ? (
              posts.map((post, index) => (
                <div key={post.id} className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground/40">
                      {index + 1}
                    </span>
                  </div>
                  <div className="pl-8">
                    <PostRow
                      post={post}
                      onClick={() => navigate(`/post/${post.id}`)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-sm text-muted-foreground">
                No reports matched this view yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
};

export default PopularProblems;
