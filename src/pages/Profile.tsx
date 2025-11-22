import { useState } from "react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PostRow from "@/components/PostRow";
import CivicBadge from "@/components/CivicBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Edit, Award, FileText, MessageSquare, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");

  const userReports = [
    {
      id: "1",
      title: "Overflowing garbage bins near Park Street",
      description: "Multiple garbage bins are overflowing...",
      imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400",
      location: "Park Street, Sector 12",
      category: "Garbage",
      upvotes: 47,
      downvotes: 3,
      commentCount: 12,
      timeAgo: "2 days ago",
    },
    {
      id: "2",
      title: "Broken streetlight creating safety concern",
      description: "Streetlight has been non-functional for weeks...",
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
      location: "MG Road",
      category: "Electricity",
      upvotes: 34,
      downvotes: 1,
      commentCount: 8,
      timeAgo: "1 week ago",
    },
  ];

  const civilPoints = 620;
  const levels = [
    { name: "Aware Citizen", min: 0, max: 199, badge: "bronze" },
    { name: "Active Helper", min: 200, max: 499, badge: "silver" },
    { name: "Community Guardian", min: 500, max: 999, badge: "silver" },
    { name: "Civic Hero", min: 1000, max: Infinity, badge: "gold" },
  ];

  const currentLevel = levels.find(
    (level) => civilPoints >= level.min && civilPoints <= level.max
  ) || levels[0];

  const progressToNext = currentLevel.max === Infinity
    ? 100
    : ((civilPoints - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <Card className="p-6 mb-4 sm:rounded-lg border-x-0 sm:border-x">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl font-bold text-primary">A</span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">Arjun Patel</h1>
                <p className="text-muted-foreground flex items-center gap-1 mb-3">
                  <MapPin className="w-4 h-4" />
                  Delhi, India
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/profile/edit")}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Civic Points */}
          <Card className="p-6 mb-4 sm:rounded-lg border-x-0 sm:border-x">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Civic Sense Points</p>
                <p className="text-4xl font-bold text-primary">{civilPoints}</p>
              </div>
              <CivicBadge level={currentLevel.badge as "bronze" | "silver" | "gold"} size="lg" />
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{currentLevel.name}</span>
                {currentLevel.max !== Infinity && (
                  <span className="text-muted-foreground">
                    {currentLevel.max - civilPoints} to next level
                  </span>
                )}
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>

            <Button 
              onClick={() => navigate("/rewards")} 
              className="w-full gap-2"
            >
              <Award className="w-4 h-4" />
              View Rewards & Perks
            </Button>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 px-4 sm:px-0">
            <Card className="p-4 text-center">
              <FileText className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold mb-1">{userReports.length}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </Card>
            <Card className="p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold mb-1">34</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold mb-1">142</p>
              <p className="text-xs text-muted-foreground">Upvotes</p>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border mb-0 px-4 sm:px-0 bg-card sm:bg-transparent">
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                activeTab === "posts"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              My Reports
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`pb-3 px-1 font-medium text-sm transition-colors ${
                activeTab === "comments"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              Comments
            </button>
          </div>

          {/* Content */}
          <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden">
            {activeTab === "posts" && userReports.map((report) => (
              <PostRow
                key={report.id}
                post={report}
                onClick={() => navigate(`/post/${report.id}`)}
              />
            ))}
            {activeTab === "comments" && (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Your comments will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
