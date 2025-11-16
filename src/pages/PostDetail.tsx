import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, MapPin, Clock, User, Share2, Bookmark, MessageSquare, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import StatusPill from "@/components/StatusPill";
import CommentItem from "@/components/CommentItem";
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

  const timeline = [
    { status: "Posted", date: issue.timeAgo, completed: true },
    { status: "Community Verified", date: "1 hour ago", completed: true },
    { status: "MCD Viewed", date: "30 mins ago", completed: issue.status !== "Pending" },
    { status: "Assigned to team", date: "", completed: issue.status === "Resolved" || issue.status === "Cleaned" },
    { status: "Resolved", date: "", completed: issue.status === "Resolved" || issue.status === "Cleaned" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-card border border-separator rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-separator">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <button className="text-muted-foreground hover:text-primary transition-colors active:scale-95">
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="text-lg font-bold">{issue.upvotes}</span>
                <button className="text-muted-foreground hover:text-destructive transition-colors active:scale-95">
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className={getCategoryColor(issue.category)}>
                    {issue.category}
                  </Badge>
                  <StatusPill status={issue.status as any} />
                </div>
                
                <h1 className="text-2xl font-bold mb-3">{issue.title}</h1>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
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

          {/* Actions Row */}
          <div className="px-4 py-3 border-b border-separator bg-accent/30">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Comment</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Bookmark className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* AI Summary */}
          <div className="p-4 border-b border-separator bg-accent/20">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">AI Check</h3>
                <p className="text-sm text-muted-foreground">
                  Likely real (89%) • No duplicates found
                </p>
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
            <p className="text-foreground leading-relaxed">{issue.description}</p>
          </div>

          {/* Timeline */}
          <div className="p-4 border-b border-separator">
            <h3 className="font-semibold mb-4">Progress Timeline</h3>
            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        item.completed
                          ? "bg-primary border-primary"
                          : "bg-background border-muted"
                      }`}
                    />
                    {index < timeline.length - 1 && (
                      <div
                        className={`w-0.5 h-8 ${
                          item.completed ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p
                      className={`text-sm font-medium ${
                        item.completed ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.status}
                    </p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reward Banner */}
          {issue.status === "Cleaned" && (
            <div className="p-4 bg-primary/10 border-b border-separator">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary">You earned +50 Civic Points!</h3>
                  <p className="text-sm text-muted-foreground">
                    Thank you for making your community better
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate("/rewards")}>
                  View Rewards
                </Button>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              Comments
              <span className="text-sm font-normal text-muted-foreground">(12)</span>
            </h2>

            <div className="space-y-4 mb-4">
              <CommentItem
                username="User123"
                text="This has been an issue for weeks. Needs urgent attention!"
                timestamp="2 hours ago"
                upvotes={15}
              />
              <CommentItem
                username="LocalResident"
                text="Thanks for reporting. I've also seen this problem."
                timestamp="4 hours ago"
                upvotes={8}
              />
              <CommentItem
                username="MCDOfficial"
                text="We have received this report and will dispatch a team soon."
                timestamp="1 day ago"
                upvotes={42}
              />
            </div>
            
            <div className="sticky bottom-20 md:bottom-4 bg-background border border-separator rounded-lg p-3">
              <Textarea
                placeholder="Add a comment..."
                rows={2}
                className="mb-2 resize-none"
              />
              <Button size="sm" className="w-full">
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default PostDetail;
