import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PostRow from "@/components/PostRow";
import CivicBadge from "@/components/CivicBadge";
import CommentItem from "@/components/CommentItem";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Award, FileText, MessageSquare, TrendingUp, LogOut, Link2, Copy, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchReports, fetchUserComments, type ReportLocation, type UserComment } from "@/services/reportService";
import { formatLocationName, formatRelativeTime } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts");
  const [copied, setCopied] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const {
    data: reportData,
    isLoading,
  } = useQuery({
    queryKey: ["my-reports", user?.id],
    queryFn: () => fetchReports({ reporter_id: user!.id, limit: 20 }),
    enabled: Boolean(user?.id),
  });

  const {
    data: commentsData,
    isLoading: isLoadingComments,
  } = useQuery({
    queryKey: ["my-comments", user?.id],
    queryFn: () => fetchUserComments({ limit: 50 }),
    enabled: Boolean(user?.id),
  });

  const reports = reportData?.data ?? [];
  const comments = commentsData?.data ?? [];
  const commentsTotal = comments.length;
  const upvotesTotal = reports.reduce((acc, report) => acc + report.upvotes, 0);

  const regionLabel = useMemo(() => {
    if (!user?.region) return "Add your region";
    return formatLocationName(user.region as ReportLocation);
  }, [user?.region]);

  const levelInfo = user?.level_info;
  const civicPoints = user?.civicPoints ?? 0;
  const badgeLevel =
    levelInfo?.level && levelInfo.level >= 5
      ? "gold"
      : levelInfo?.level && levelInfo.level >= 3
      ? "silver"
      : "bronze";

  const profileUrl = user?.id ? `${window.location.origin}/user/${user.id}` : "";

  const handleCopyProfileUrl = async () => {
    if (!profileUrl) return;
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Profile URL copied!",
        description: "Share your profile link with others.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center space-y-4">
        <p className="text-lg font-semibold">Login to access your civic profile</p>
        <Button onClick={() => navigate("/login?redirect=/profile")}>Login</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Header />

      <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4">
        <div className="max-w-3xl mx-auto">
          {/* Profile Header */}
          <Card className="p-6 mb-4 sm:rounded-lg border-x-0 sm:border-x">
            <div className="flex items-start gap-4">
              <Avatar className="w-20 h-20 flex-shrink-0">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user?.username || "User"} />
                ) : null}
                <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                  {(user?.username || "User").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold mb-1">
                      {user?.username || "Anonymous Citizen"}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{regionLabel}</span>
                    </p>
                    {user?.badges && user.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {user.badges.map((badge) => (
                          <Badge key={badge} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={logout} className="gap-2 flex-shrink-0">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
                
                {user?.bio && (
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap break-words">
                    {user.bio}
                  </p>
                )}

                {profileUrl && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-accent/50 rounded-md border border-border">
                    <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                      {profileUrl}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 flex-shrink-0"
                      onClick={handleCopyProfileUrl}
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                )}

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
                <p className="text-4xl font-bold text-primary">{civicPoints}</p>
              </div>
              <CivicBadge level={badgeLevel as "bronze" | "silver" | "gold"} size="lg" />
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{levelInfo?.name || "New Citizen"}</span>
                {levelInfo?.next_level_at && (
                  <span className="text-muted-foreground">
                    {Math.max(0, levelInfo.next_level_at - civicPoints)} to next level
                  </span>
                )}
              </div>
              <Progress value={Math.min(100, levelInfo?.progress ?? 0)} className="h-2" />
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
              <p className="text-2xl font-bold mb-1">{reports.length}</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </Card>
            <Card className="p-4 text-center">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold mb-1">{commentsTotal}</p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </Card>
            <Card className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold mb-1">{upvotesTotal}</p>
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
          <div className="bg-card sm:rounded-lg sm:border sm:border-border overflow-hidden min-h-[200px]">
            {activeTab === "posts" && (
              <>
                {isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading your reports…
                  </div>
                ) : reports.length ? (
                  reports.map((report) => (
                    <PostRow
                      key={report.id}
                      post={report}
                      onClick={() => navigate(`/post/${report.id}`)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    You haven&apos;t filed any reports yet.
                  </div>
                )}
              </>
            )}
            {activeTab === "comments" && (
              <>
                {isLoadingComments ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading your comments…
                  </div>
                ) : comments.length > 0 ? (
                  <div className="divide-y divide-border">
                    {comments.map((comment: UserComment) => (
                      <div key={comment.id} className="p-4 hover:bg-accent/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-foreground">
                                {comment.author?.username || "Anonymous"}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {formatRelativeTime(comment.created_at)}
                              </span>
                              {comment.updated_at !== comment.created_at && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground italic">(edited)</span>
                                </>
                              )}
                            </div>
                            <p className="text-sm text-foreground mb-2 whitespace-pre-wrap break-words">
                              {comment.text}
                            </p>
                            {comment.reportId && comment.reportTitle && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary gap-1"
                                onClick={() => navigate(`/post/${comment.reportId}`)}
                              >
                                <ExternalLink className="w-3 h-3" />
                                View report: {comment.reportTitle}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
                    <MessageSquare className="w-12 h-12 text-primary/60" />
                    <div>
                      <p className="text-base font-semibold text-foreground">No comments yet</p>
                      <p className="text-sm text-muted-foreground">
                        Your comments will appear here once you start sharing feedback on reports.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                      Explore reports
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
