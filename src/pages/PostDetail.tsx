import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, MapPin, Clock, User } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { dummyIssues } from "@/lib/dummyData";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const issue = dummyIssues.find((i) => i.id === id);

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Garbage: "bg-orange-500/10 text-orange-700 border-orange-200",
      Road: "bg-blue-500/10 text-blue-700 border-blue-200",
      Water: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
      Trees: "bg-green-500/10 text-green-700 border-green-200",
      Electricity: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      Other: "bg-gray-500/10 text-gray-700 border-gray-200",
    };
    return colors[category] || colors.Other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-500/10 text-yellow-700",
      "High Priority": "bg-red-500/10 text-red-700",
      Cleaned: "bg-green-500/10 text-green-700",
      Rejected: "bg-gray-500/10 text-gray-700",
    };
    return colors[status] || colors.Pending;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        <div className="bg-card border border-separator rounded overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-separator">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 pt-1">
                <button className="text-muted-foreground hover:text-primary">
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="text-lg font-bold">{issue.upvotes}</span>
                <button className="text-muted-foreground hover:text-destructive">
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getCategoryColor(issue.category)}>
                    {issue.category}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(issue.status)}>
                    {issue.status}
                  </Badge>
                </div>
                
                <h1 className="text-2xl font-bold mb-3">{issue.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {issue.reporterName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {issue.timeAgo}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {issue.location}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          {issue.imageUrl && (
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full max-h-[500px] object-cover"
            />
          )}

          {/* Description */}
          <div className="p-4 border-b border-separator">
            <p className="text-foreground">{issue.description}</p>
          </div>

          {/* Comments Section */}
          <div className="p-4">
            <h2 className="font-semibold mb-4">Comments</h2>
            
            <div className="mb-4">
              <Textarea placeholder="Add a comment..." rows={3} className="mb-2" />
              <Button size="sm">Post Comment</Button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="border-l-2 border-border pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">User123</span>
                  <span className="text-xs text-muted-foreground">2 hours ago</span>
                </div>
                <p className="text-muted-foreground">
                  This has been an issue for weeks. Needs urgent attention!
                </p>
              </div>

              <div className="border-l-2 border-border pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">LocalResident</span>
                  <span className="text-xs text-muted-foreground">4 hours ago</span>
                </div>
                <p className="text-muted-foreground">
                  Thanks for reporting. I've also seen this problem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostDetail;
