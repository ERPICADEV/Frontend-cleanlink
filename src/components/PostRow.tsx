import { ChevronUp, ChevronDown, MessageSquare, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractFirstImage, formatCategoryLabel, formatLocationName, formatRelativeTime } from "@/lib/formatters";
import StatusPill from "@/components/StatusPill";
import type { ReportSummary } from "@/services/reportService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voteOnReport } from "@/services/reportService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const currentUserVote = post.user_vote || 0;

  const voteMutation = useMutation({
    mutationFn: (value: 1 | -1) => voteOnReport(post.id, value),
    onMutate: async (value) => {
      await queryClient.cancelQueries({ queryKey: ['reports'] });
      
      // Optimistic update - allow toggling off
      const newVote = currentUserVote === value ? 0 : value;
      
      queryClient.setQueryData(['reports'], (old: any) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((report: any) =>
              report.id === post.id
                ? {
                    ...report,
                    user_vote: newVote,
                  }
                : report
            ),
          })),
        };
      });
    },
    onSuccess: () => {
      // Refetch to get accurate vote counts
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (err, variables, context) => {
      // Revert on error
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const handleVote = (value: 1 | -1, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to vote on reports",
        variant: "destructive",
      });
      navigate(`/login?redirect=/`);
      return;
    }
    
    voteMutation.mutate(value);
  };

  const imageUrl = extractFirstImage(post.images);
  const categoryLabel = formatCategoryLabel(post.category);
  const timeAgo = post.createdAt ? formatRelativeTime(post.createdAt) : "Just now";
  const locationLabel = formatLocationName(post.location);
  const commentsCount = post.comments_count ?? 0;
  const status = post.status;
  const categoryTone = getCategoryTone(post.category);

  return (
    <div className="border-b border-border bg-card hover:bg-accent/30 transition-colors">
      <div className="flex gap-2 p-3 sm:p-4">
        {/* Upvote Column */}
        <div className="flex flex-col items-center gap-0.5 pt-1 w-10 flex-shrink-0">
          <button 
            className={cn(
              "p-1.5 hover:bg-accent rounded transition-colors touch-manipulation",
              voteMutation.isPending && "opacity-50 cursor-not-allowed",
              currentUserVote === 1 && "text-primary"
            )}
            aria-label="Upvote"
            onClick={(e) => handleVote(1, e)}
            disabled={voteMutation.isPending}
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className={cn(
            "text-sm font-semibold tabular-nums",
            currentUserVote === 1 && "text-primary",
            currentUserVote === -1 && "text-destructive",
            currentUserVote === 0 && "text-muted-foreground"
          )}>
            {currentUserVote}
          </span>
          <button 
            className={cn(
              "p-1.5 hover:bg-accent rounded transition-colors touch-manipulation",
              voteMutation.isPending && "opacity-50 cursor-not-allowed",
              currentUserVote === -1 && "text-destructive"
            )}
            aria-label="Downvote"
            onClick={(e) => handleVote(-1, e)}
            disabled={voteMutation.isPending}
          >
            <ChevronDown className="w-5 h-5" />
          </button>
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
  );
};

export default PostRow;