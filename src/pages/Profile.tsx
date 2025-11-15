import { User, Award, TrendingUp, LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import IssueCard from "@/components/IssueCard";
import { dummyIssues } from "@/lib/dummyData";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const userReports = dummyIssues.slice(0, 3);
  const civilPoints = 485;
  const level = 3;
  const pointsToNextLevel = 515;
  const progress = (civilPoints / 1000) * 100;

  const badges = [
    { name: "Bronze Reporter", icon: "🥉", unlocked: true },
    { name: "Silver Reporter", icon: "🥈", unlocked: true },
    { name: "Gold Reporter", icon: "🥇", unlocked: false },
    { name: "Eco Champion", icon: "🌱", unlocked: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">Rahul Kumar</h1>
              <p className="text-muted-foreground mb-4">Active Contributor</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Level {level}</span>
                  <span className="text-sm text-muted-foreground">
                    {pointsToNextLevel} points to Level {level + 1}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex gap-3 mt-4">
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
            <h2 className="text-xl font-semibold">Civil Points</h2>
          </div>
          <div className="text-4xl font-bold text-primary mb-4">{civilPoints}</div>
          <p className="text-sm text-muted-foreground">
            Keep contributing to earn more points and unlock rewards!
          </p>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Badges Earned</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`p-4 border rounded-lg text-center ${
                  badge.unlocked ? "bg-accent" : "bg-muted opacity-50"
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-sm font-medium">{badge.name}</p>
                {!badge.unlocked && (
                  <Badge variant="outline" className="mt-2">
                    Locked
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Impact Summary</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">Issues Reported</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">5</div>
              <p className="text-sm text-muted-foreground">Issues Resolved</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">47</div>
              <p className="text-sm text-muted-foreground">Community Votes</p>
            </div>
          </div>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">My Reports</h2>
          <div className="space-y-4">
            {userReports.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => navigate(`/issue/${issue.id}`)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
