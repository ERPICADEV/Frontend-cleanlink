import { useState } from "react";
import { Search } from "lucide-react";
import Navigation from "@/components/Navigation";
import FloatingActionButton from "@/components/FloatingActionButton";
import IssueCard from "@/components/IssueCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Garbage", "Road", "Water", "Trees", "Electricity", "Other"];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredIssues = dummyIssues.filter((issue) => {
    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Community Reports</h1>
          <p className="text-muted-foreground">
            Help improve your city by reporting and validating civic issues
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by area or issue..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pb-20">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => navigate(`/issue/${issue.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No issues found matching your criteria</p>
            </div>
          )}
        </div>
      </main>

      <FloatingActionButton />
    </div>
  );
};

export default Home;
