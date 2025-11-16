import { User, Award, TrendingUp, LogOut } from "lucide-react";
import Header from "@/components/Header";
import PostRow from "@/components/PostRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const userReports = dummyIssues.slice(0, 5).map(issue => ({
    ...issue,
    commentCount: Math.floor(Math.random() * 100) + 5,
  }));
  const civilPoints = 485;

  const badges = [
    { name: "Active Reporter", unlocked: true },
    { name: "Community Helper", unlocked: true },
    { name: "Top Contributor", unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-1">Rahul Kumar</h1>
              <p className="text-sm text-muted-foreground mb-3">South Delhi, Delhi</p>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
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

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Citizen Points</h2>
          </div>
          <div className="text-3xl font-bold text-primary mb-2">{civilPoints}</div>
          <p className="text-sm text-muted-foreground">
            Keep contributing to earn more points!
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Activity</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Posts Made</p>
            </div>
            <div>
              <div className="text-xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
            <div>
              <div className="text-xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">Votes Given</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Achievements</h2>
          <div className="flex gap-3 flex-wrap">
            {badges.map((badge) => (
              <Badge
                key={badge.name}
                variant={badge.unlocked ? "default" : "outline"}
                className={!badge.unlocked ? "opacity-50" : ""}
              >
                {badge.name}
              </Badge>
            ))}
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">My Posts</h2>
          <div className="bg-card border border-separator rounded">
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
    </div>
  );
};

export default Profile;
