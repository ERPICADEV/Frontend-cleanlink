import { useState } from "react";
import Header from "@/components/Header";
import PostRow from "@/components/PostRow";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";

const PopularProblems = () => {
  const [region, setRegion] = useState("city");
  const navigate = useNavigate();

  const posts = dummyIssues.map(issue => ({
    ...issue,
    commentCount: Math.floor(Math.random() * 100) + 5,
  })).sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Popular Problems</h1>
            <p className="text-sm text-muted-foreground">
              Trending issues based on location
            </p>
          </div>

          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="city">Your City</SelectItem>
              <SelectItem value="state">Your State</SelectItem>
              <SelectItem value="india">All India</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-3">Trending in Your City</h2>
            <div className="bg-card border border-separator rounded">
              {posts.slice(0, 5).map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onClick={() => navigate(`/post/${post.id}`)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Trending in Your State</h2>
            <div className="bg-card border border-separator rounded">
              {posts.slice(5, 10).map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onClick={() => navigate(`/post/${post.id}`)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">Trending in India</h2>
            <div className="bg-card border border-separator rounded">
              {posts.slice(10, 15).map((post) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onClick={() => navigate(`/post/${post.id}`)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PopularProblems;
