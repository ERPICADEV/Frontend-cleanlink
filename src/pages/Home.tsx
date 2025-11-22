import { useState } from "react";
import Header from "@/components/Header";
import RegionSelector from "@/components/RegionSelector";
import PostRow from "@/components/PostRow";
import TrendingSidebar from "@/components/TrendingSidebar";
import BottomNav from "@/components/BottomNav";
import FloatingActionButton from "@/components/FloatingActionButton";
import FirstTimeTooltip from "@/components/FirstTimeTooltip";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const categories = ["All", "Garbage", "Road", "Water", "Trees", "Electricity", "Other"];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  const filteredIssues = dummyIssues.filter((issue) => {
    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    return matchesCategory;
  });

  const posts = filteredIssues.map(issue => ({
    ...issue,
    commentCount: Math.floor(Math.random() * 100) + 5,
  }));

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <FirstTimeTooltip />
      <Header />
      
      {/* Region Strip - Clean & Minimal */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between">
          <RegionSelector />
        </div>
      </div>

      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4 md:flex md:gap-6">
        {/* Main Feed */}
        <div className="flex-1 max-w-3xl mx-auto">
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

          {/* Posts Feed - Clean Reddit Style */}
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
                <p className="text-muted-foreground mb-2 font-medium">No posts here yet</p>
                <p className="text-sm text-muted-foreground">
                  Be the first to report in your area!
                </p>
              </div>
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
