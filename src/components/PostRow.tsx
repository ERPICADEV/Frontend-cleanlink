import { ChevronUp, ChevronDown, MessageSquare, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractFirstImage, formatCategoryLabel, formatLocationName, formatRelativeTime } from "@/lib/formatters";
import StatusPill from "@/components/StatusPill";
import type { ReportSummary } from "@/services/reportService";
import { voteOnReport } from "@/services/reportService";
import { useVote, type VoteState, type VoteValue } from "@/hooks/useVote";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostRowProps {
  post: ReportSummary;
  onClick: () => void;
}

const getCategoryTone = (category?: string) => {
  const tones: Record<string, string> = {
    garbage: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-200",
    road: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
    water: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200",
    trees: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200",
    electricity: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-200",
    drainage: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200",
  };
  return tones[category?.toLowerCase() ?? ""] || "bg-muted text-muted-foreground";
};

const PostRow = ({ post, onClick }: PostRowProps) => {
  const voteState: VoteState = {
    upvotes: post.upvotes || 0,
    downvotes: post.downvotes || 0,
    userVote: (post.user_vote as 1 | -1 | 0) || 0,
  };

  const { handleVote, isVoting, currentState } = useVote({
    entityId: post.id,
    currentState: voteState,
    voteFn: voteOnReport,
    queryKey: ['reports'],
    getCurrentState: (data: any) => {
      // Find the post in the infinite query pages
      if (data?.pages) {
        for (const page of data.pages) {
          const report = page.data?.find((r: any) => r.id === post.id);
          if (report) {
            return {
              upvotes: report.upvotes || 0,
              downvotes: report.downvotes || 0,
              userVote: ((report.user_vote === 1 || report.user_vote === -1 || report.user_vote === 0) ? report.user_vote : 0) as VoteValue,
            };
          }
        }
      }
      // Fallback to prop state
      return voteState;
    },
    updateCache: (old: any, result) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page: any) => ({
          ...page,
          data: page.data.map((report: any) =>
            report.id === post.id
              ? {
                  ...report,
                  upvotes: result.newUpvotes,
                  downvotes: result.newDownvotes,
                  user_vote: result.newUserVote,
                }
              : report
          ),
        })),
      };
    },
    authRedirect: '/login?redirect=/',
  });

  const currentUserVote = currentState.userVote;
  const netVoteCount = currentState.upvotes - currentState.downvotes;

  const handleVoteClick = (value: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    handleVote(value);
  };

  const imageUrl = extractFirstImage(post.images);
  const categoryLabel = formatCategoryLabel(post.category);
  const timeAgo = post.createdAt ? formatRelativeTime(post.createdAt) : "Just now";
  const locationLabel = formatLocationName(post.location);
  const commentsCount = post.comments_count ?? 0;
  const status = post.status;
  const categoryTone = getCategoryTone(post.category);

  return (
    <TooltipProvider>
      <div className="border-b border-border bg-card hover:bg-accent/30 transition-colors">
        <div className="flex gap-2 p-3 sm:p-4">
          {/* Upvote Column */}
          <div className="flex flex-col items-center gap-0.5 pt-1 w-10 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={cn(
                    "p-1.5 hover:bg-accent rounded transition-all duration-200 touch-manipulation",
                    "active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    isVoting && "opacity-50 cursor-not-allowed",
                    currentUserVote === 1 && "text-primary bg-primary/10"
                  )}
                  aria-label={currentUserVote === 1 ? "Remove upvote" : "Upvote"}
                  onClick={(e) => handleVoteClick(1, e)}
                  disabled={isVoting}
                >
                  <ChevronUp className={cn("w-5 h-5 transition-transform", currentUserVote === 1 && "scale-110")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentUserVote === 1 ? "Remove upvote" : "Upvote"}</p>
              </TooltipContent>
            </Tooltip>
            <span className={cn(
              "text-sm font-semibold tabular-nums transition-colors duration-200",
              currentUserVote === 1 && "text-primary",
              currentUserVote === -1 && "text-destructive",
              currentUserVote === 0 && "text-muted-foreground"
            )}>
              {netVoteCount}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className={cn(
                    "p-1.5 hover:bg-accent rounded transition-all duration-200 touch-manipulation",
                    "active:scale-95 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
                    isVoting && "opacity-50 cursor-not-allowed",
                    currentUserVote === -1 && "text-destructive bg-destructive/10"
                  )}
                  aria-label={currentUserVote === -1 ? "Remove downvote" : "Downvote"}
                  onClick={(e) => handleVoteClick(-1, e)}
                  disabled={isVoting}
                >
                  <ChevronDown className={cn("w-5 h-5 transition-transform", currentUserVote === -1 && "scale-110")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentUserVote === -1 ? "Remove downvote" : "Downvote"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-base line-clamp-2 leading-snug flex-1">
              {post.title}
            </h3>
            {status && <StatusPill status={status} />}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
            {post.description}
          </p>
          
          {/* Meta Row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className={cn("px-2 py-0.5 rounded-full font-medium", categoryTone)}>
              {categoryLabel}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{locationLabel}</span>
            </span>
            <span>•</span>
            <span>{timeAgo}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {commentsCount}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {imageUrl && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={onClick}
            />
          </div>
        )}
      </div>
    </div>
    </TooltipProvider>
  );
};

export default PostRow;