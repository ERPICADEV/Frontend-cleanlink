import { User, Award, TrendingUp, LogOut, Settings } from "lucide-react";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PostRow from "@/components/PostRow";
import CivicBadge from "@/components/CivicBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const userReports = dummyIssues.slice(0, 5).map(issue => ({
    ...issue,
    commentCount: Math.floor(Math.random() * 100) + 5,
  }));
  const civilPoints = 485;

  const levels = [
    { name: "New Reporter", min: 0, max: 199, badge: "bronze" as const },
    { name: "Active Contributor", min: 200, max: 499, badge: "silver" as const },
    { name: "Community Steward", min: 500, max: 999, badge: "gold" as const },
    { name: "Eco Champion", min: 1000, max: 999999, badge: "gold" as const },
  ];

  const currentLevel = levels.find(
    (level) => civilPoints >= level.min && civilPoints <= level.max
  ) || levels[0];

  const progressToNext = levels.findIndex((l) => l === currentLevel) < levels.length - 1
    ? ((civilPoints - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100
    : 100;

  const badges = [
    { name: "Active Reporter", unlocked: true, level: "bronze" as const },
    { name: "Community Helper", unlocked: true, level: "silver" as const },
    { name: "Top Contributor", unlocked: false, level: "gold" as const },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profile</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-1">Rahul Kumar</h2>
              <p className="text-sm text-muted-foreground mb-3">South Delhi, Delhi</p>
              
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/profile/edit")}
                >
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Civic Points & Level */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Civic Sense Points</h2>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-4xl font-bold text-primary">{civilPoints}</div>
              <div className="flex items-center gap-2 mt-1">
                <CivicBadge level={currentLevel.badge} size="sm" />
                <span className="text-sm font-medium text-muted-foreground">
                  {currentLevel.name}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/rewards")}
            >
              View Rewards
            </Button>
          </div>

          {progressToNext < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress to next level</span>
                <span>
                  {currentLevel.max - civilPoints} pts to go
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Activity Stats</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">Reports</p>
            </div>
            <div>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground mt-1">Comments</p>
            </div>
            <div>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground mt-1">Votes</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <div className="flex gap-3 flex-wrap">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                  badge.unlocked
                    ? "border-primary/20 bg-primary/5"
                    : "border-muted bg-muted/30 opacity-60"
                }`}
              >
                <CivicBadge level={badge.level} size="sm" />
                <span className="text-sm font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">My Reports</h2>
          <div className="bg-card border border-separator rounded-lg overflow-hidden">
            {userReports.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                onClick={() => navigate(`/post/${post.id}`)}
              />
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
