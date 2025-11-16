import { useState } from "react";
import { Plus, Search } from "lucide-react";
import Header from "@/components/Header";
import RegionSelector from "@/components/RegionSelector";
import PostRow from "@/components/PostRow";
import TrendingSidebar from "@/components/TrendingSidebar";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";

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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <RegionSelector />

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-3 border-b border-separator">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search problems, locations..."
            className="pl-10 h-9"
            onClick={() => navigate("/search")}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main Feed */}
          <main className="flex-1 max-w-3xl">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-separator scrollbar-hide">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="whitespace-nowrap flex-shrink-0"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Post Feed */}
            <div className="bg-card border border-separator rounded-lg overflow-hidden">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onClick={() => navigate(`/post/${post.id}`)}
                  />
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <p className="text-muted-foreground mb-2">No posts here yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to report in your area!
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <TrendingSidebar />
          </aside>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/create-post")}
        className="fixed bottom-24 right-6 md:bottom-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all active:scale-95 z-40"
        aria-label="Report an issue"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BottomNav />
    </div>
  );
};

export default Home;
