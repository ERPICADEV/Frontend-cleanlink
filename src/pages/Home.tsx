import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/Header";
import RegionSelector from "@/components/RegionSelector";
import PostRow from "@/components/PostRow";
import TrendingSidebar from "@/components/TrendingSidebar";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      <Header />
      <RegionSelector />

      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main Feed */}
          <main className="flex-1 max-w-3xl">
            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-separator">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Post Feed */}
            <div className="bg-card border border-separator rounded">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onClick={() => navigate(`/post/${post.id}`)}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No issues found</p>
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
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Home;
