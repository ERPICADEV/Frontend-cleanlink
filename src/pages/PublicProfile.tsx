import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { useQuery } from "@tanstack/react-query";
import { fetchReports, type ReportSummary } from "@/services/reportService";
import PostRow from "@/components/PostRow";
import { Loader2, ArrowLeft } from "lucide-react";
import { formatLocationName } from "@/lib/formatters";

const PublicProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = usePublicProfile(userId);

  const {
    data: reportsData,
    isLoading: isLoadingReports,
  } = useQuery({
    queryKey: ["user-reports", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await fetchReports({ reporter_id: userId, limit: 10 });
      return res.data as ReportSummary[];
    },
  });

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-10 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading profile…</p>
        </main>
      </div>
    );
  }

  if (isProfileError || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center space-y-4">
          <h1 className="text-2xl font-bold">User not found</h1>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </main>
      </div>
    );
  }

  // Handle both camelCase and snake_case responses from backend
  const avatarUrl = profile.avatarUrl ?? (profile as any).avatar_url ?? null;
  const bio = profile.bio ?? (profile as any).bio ?? null;
  const civicPoints = profile.civicPoints ?? (profile as any).civic_points ?? 0;
  const civicLevel =
    profile.level_info?.level ??
    profile.civicLevel ??
    (profile as any).civic_level ??
    1;
  const badges = profile.badges ?? (profile as any).badges ?? [];
  const regionLabel = profile.region ? formatLocationName(profile.region) : "Region not set";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr),minmax(0,3fr)]">
          {/* Left: Profile info */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile.username || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{(profile.username || "U").charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <h1 className="text-2xl font-bold leading-tight">
                      {profile.username || "Anonymous Citizen"}
                    </h1>
                    <p className="text-sm text-muted-foreground">{regionLabel}</p>
                  </div>
                  {badges && badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {badges.map((badge) => (
                        <Badge key={badge} variant="outline">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {bio && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {bio}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="font-semibold mb-4">Civic Stats</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{civicPoints}</p>
                  <p className="text-xs text-muted-foreground">Civic Points</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {civicLevel}
                  </p>
                  <p className="text-xs text-muted-foreground">Level</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {reportsData?.length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Reports</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: User reports */}
          <div className="space-y-4">
            <Card className="p-4">
              <h2 className="font-semibold mb-3">Recent Reports</h2>
              {isLoadingReports ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading reports…
                </div>
              ) : !reportsData || reportsData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  This citizen hasn&apos;t filed any reports yet.
                </p>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  {reportsData.map((report) => (
                    <PostRow
                      key={report.id}
                      post={report}
                      onClick={() => navigate(`/post/${report.id}`)}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicProfile;


