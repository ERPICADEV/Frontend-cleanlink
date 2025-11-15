import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, MapPin, Clock, User, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { dummyIssues } from "@/lib/dummyData";

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const issue = dummyIssues.find((i) => i.id === id);

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Issue not found</h1>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Garbage: "bg-orange-100 text-orange-800 border-orange-200",
      Road: "bg-blue-100 text-blue-800 border-blue-200",
      Water: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Trees: "bg-green-100 text-green-800 border-green-200",
      Electricity: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || colors.Other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "High Priority": "bg-red-100 text-red-800 border-red-200",
      Cleaned: "bg-green-100 text-green-800 border-green-200",
      Rejected: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || colors.Pending;
  };

  const timelineSteps = [
    { label: "Posted", date: issue.timeAgo, completed: true },
    { label: "Community Verified", date: "Pending", completed: false },
    { label: "MCD Viewed", date: "Pending", completed: false },
    { label: "Assigned to Team", date: "Pending", completed: false },
    { label: "Resolved", date: "Pending", completed: issue.status === "Cleaned" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <img
              src={issue.imageUrl}
              alt={issue.title}
              className="w-full h-96 object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl font-bold">{issue.title}</h1>
                <Badge variant="outline" className={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{issue.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{issue.timeAgo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{issue.reporterName}</span>
                </div>
              </div>

              <Badge variant="outline" className={getCategoryColor(issue.category)}>
                {issue.category}
              </Badge>

              <div className="flex items-center gap-4 mt-6">
                <Button variant="outline" className="gap-2">
                  <ArrowUp className="w-4 h-4" />
                  Upvote ({issue.upvotes})
                </Button>
                <Button variant="outline" className="gap-2">
                  <ArrowDown className="w-4 h-4" />
                  Downvote ({issue.downvotes})
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground">{issue.description}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Analysis</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Legitimacy Score</span>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  High (87%)
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Duplicate Probability</span>
                <Badge variant="outline">Low (12%)</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Severity Estimate</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  Medium
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Report Timeline</h2>
            <div className="space-y-4">
              {timelineSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      {step.completed && <CheckCircle2 className="w-5 h-5 text-primary-foreground" />}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div className={`w-0.5 h-12 ${step.completed ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium">{step.label}</p>
                    <p className="text-sm text-muted-foreground">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Community Discussion</h2>
            <div className="space-y-4">
              <Textarea placeholder="Add a comment..." rows={3} />
              <Button>Post Comment</Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default IssueDetail;
