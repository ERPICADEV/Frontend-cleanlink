import { TrendingUp, ArrowUp, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { fetchReports, type ReportSummary } from "@/services/reportService";
import { useNavigate } from "react-router-dom";
import { formatRelativeTime } from "@/lib/formatters";

const TrendingList = ({
  title,
  reports,
  isLoading,
}: {
  title: string;
  reports: ReportSummary[];
  isLoading: boolean;
}) => {
  const navigate = useNavigate();

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
      </div>
      <div className="space-y-2">
        {reports.map((report) => (
          <button
            key={report.id}
            onClick={() => navigate(`/post/${report.id}`)}
            className="flex gap-2 py-1 hover:bg-accent/50 rounded px-1 w-full text-left"
          >
            <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
              <ArrowUp className="w-3 h-3" />
              <span className="text-xs font-medium">{report.upvotes}</span>
            </div>
            <div className="flex-1">
              <p className="text-xs text-foreground line-clamp-2">{report.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatRelativeTime(report.createdAt)}
              </p>
            </div>
          </button>
        ))}
        {!isLoading && reports.length === 0 && (
          <p className="text-xs text-muted-foreground">No trending reports yet.</p>
        )}
      </div>
    </Card>
  );
};

const TrendingSidebar = () => {
  const {
    data: localData,
    isLoading: loadingLocal,
  } = useQuery({
    queryKey: ["trending", "local"],
    queryFn: () => fetchReports({ sort: "hot", limit: 5 }),
    staleTime: 60_000,
    retry: (failureCount, error: any) => {
      // Don't retry on 503 (Service Unavailable)
      if (error?.status === 503) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });

  const {
    data: indiaData,
    isLoading: loadingIndia,
  } = useQuery({
    queryKey: ["trending", "india"],
    queryFn: () => fetchReports({ sort: "top", limit: 5 }),
    staleTime: 60_000,
    retry: (failureCount, error: any) => {
      // Don't retry on 503 (Service Unavailable)
      if (error?.status === 503) return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });

  return (
    <div className="space-y-4">
      <TrendingList
        title="Trending in your area"
        reports={localData?.data ?? []}
        isLoading={loadingLocal}
      />
      <TrendingList
        title="Trending across India"
        reports={indiaData?.data ?? []}
        isLoading={loadingIndia}
      />
    </div>
  );
};

export default TrendingSidebar;
