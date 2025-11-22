import { useState } from "react";
import Header from "@/components/Header";
import PostRow from "@/components/PostRow";
import BottomNav from "@/components/BottomNav";
import FloatingActionButton from "@/components/FloatingActionButton";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TrendingUp, MapPin } from "lucide-react";

const PopularProblems = () => {
  const [view, setView] = useState<"local" | "trending">("local");
  const navigate = useNavigate();

  const posts = dummyIssues
    .map(issue => ({
      ...issue,
      commentCount: Math.floor(Math.random() * 100) + 5,
    }))
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 20);

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
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="max-w-3xl mx-auto">
          {/* Posts Feed */}
          <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden">
            {posts.map((post, index) => (
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
            ))}
          </div>
        </div>
      </div>

      <FloatingActionButton />
      <BottomNav />
    </div>
  );
};

export default PopularProblems;
