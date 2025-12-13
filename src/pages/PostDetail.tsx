import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  MapPin,
  Clock,
  User,
  Share2,
  Bookmark,
  MessageSquare,
  CheckCircle,
  Loader2,
  RefreshCcw,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import StatusPill from "@/components/StatusPill";
import CommentItem from "@/components/CommentItem";
import { EditReportModal } from "@/components/EditReportModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  createComment,
  fetchReportDetail,
  type ReportComment,
  type ReportDetail,
  voteOnReport,
  voteOnComment,
} from "@/services/reportService";
import {
  extractFirstImage,
  formatCategoryLabel,
  formatLocationName,
  formatRelativeTime,
} from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useCommentActions } from "@/hooks/useCommentActions";
import { useReportActions } from "@/hooks/useReportActions";
import { useVote, type VoteState, type VoteValue, calculateVoteChange } from "@/hooks/useVote";
import { cn } from "@/lib/utils";

const statusSteps = [
  { key: "pending", label: "Submitted" },
  { key: "community_verified", label: "Community verified" },
  { key: "assigned", label: "Assigned to civic team" },
  { key: "resolved", label: "Resolved" },
];

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const commentActions = useCommentActions({
    reportId: id!,
    onSuccess: () => {
      // Comments will be refetched automatically via query invalidation
    },
  });

  const reportActions = useReportActions({
    reportId: id!,
    onSuccess: () => {
      setShowEditModal(false);
    },
  });

  const {
    data: report,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => fetchReportDetail(id!),
    enabled: Boolean(id),
    retry: 1,
    // Prevent unnecessary refetches that cause flicker
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Use the vote hook for report voting
  const reportVoteState: VoteState = report ? {
    upvotes: report.upvotes || 0,
    downvotes: report.downvotes || 0,
    userVote: ((report.user_vote === 1 || report.user_vote === -1 || report.user_vote === 0) ? report.user_vote : 0) as VoteValue,
  } : { upvotes: 0, downvotes: 0, userVote: 0 as const };

  const { handleVote: handleReportVote, isVoting: isVotingReport, currentState: reportVoteStateCurrent } = useVote({
    entityId: id!,
    currentState: reportVoteState,
    voteFn: voteOnReport,
    queryKey: ["report", id],
    getCurrentState: (data: any) => ({
      upvotes: data.upvotes || 0,
      downvotes: data.downvotes || 0,
      userVote: ((data.user_vote === 1 || data.user_vote === -1 || data.user_vote === 0) ? data.user_vote : 0) as VoteValue,
    }),
    updateCache: (old: any, result) => {
      if (!old) return old;
      return {
        ...old,
        upvotes: result.newUpvotes,
        downvotes: result.newDownvotes,
        user_vote: result.newUserVote,
      };
    },
    requireAuth: true,
    authRedirect: `/login?redirect=/post/${id}`,
  });

  const commentMutation = useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string }) =>
      createComment(id!, { text, parent_comment_id: parentId }),
    onSuccess: (_, variables) => {
      if (variables.parentId) {
        setReplyText((prev) => {
          const newState = { ...prev };
          delete newState[variables.parentId!];
          return newState;
        });
        setReplyingTo(null);
      } else {
        setCommentText("");
      }
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      toast({
        title: "Comment posted",
        description: variables.parentId ? "Reply posted!" : "Thanks for adding more context!",
      });
    },
    onError: () => {
      toast({
        title: "Unable to comment",
        description: "Please try again or log in again.",
        variant: "destructive",
      });
    },
  });

  // Helper function to find a comment by ID in nested structure
  const findCommentById = (comments: any[], commentId: string): any => {
    for (const c of comments) {
      if (c.id === commentId) return c;
      if (c.replies) {
        const found = findCommentById(c.replies, commentId);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to update a comment by ID in nested structure
  const updateCommentById = (comments: any[], commentId: string, updater: (c: any) => any): any[] => {
    return comments.map((c: any) => {
      if (c.id === commentId) {
        return updater(c);
      }
      if (c.replies) {
        return { ...c, replies: updateCommentById(c.replies, commentId, updater) };
      }
      return c;
    });
  };

  // Comment voting handler using mutation
  const commentVoteMutation = useMutation({
    mutationFn: ({ commentId, value }: { commentId: string; value: 1 | -1 }) =>
      voteOnComment(commentId, value),
    onMutate: async ({ commentId, value }) => {
      await queryClient.cancelQueries({ queryKey: ["report", id] });
      const previousReport = queryClient.getQueryData(["report", id]);

      // Read current state from cache (most current, includes any previous optimistic updates)
      const cachedReport = queryClient.getQueryData(["report", id]) as any;
      if (!cachedReport?.comments) {
        return { previousReport, expectedUserVote: null };
      }

      const comment = findCommentById(cachedReport.comments, commentId);
      if (!comment) {
        return { previousReport, expectedUserVote: null };
      }

      // Get current vote state from cache (source of truth)
      const currentVoteState: VoteState = {
        upvotes: comment.upvotes || 0,
        downvotes: comment.downvotes || 0,
        userVote: ((comment.user_vote === 1 || comment.user_vote === -1 || comment.user_vote === 0) 
          ? comment.user_vote 
          : 0) as VoteValue,
      };

      // Calculate expected final state after vote
      const voteChange = calculateVoteChange(currentVoteState, value);
      const expectedUserVote: VoteValue = voteChange.newUserVote;

      // Apply optimistic update ONCE - replace state, don't add deltas
      queryClient.setQueryData(["report", id], (old: any) => {
        if (!old?.comments) return old;

        // Verify we're updating the same comment we calculated for
        const currentComment = findCommentById(old.comments, commentId);
        if (!currentComment) return old;

        // Only update if the comment's current state matches what we calculated from
        // This prevents double updates if onSuccess runs before onMutate completes
        const currentState: VoteState = {
          upvotes: currentComment.upvotes || 0,
          downvotes: currentComment.downvotes || 0,
          userVote: ((currentComment.user_vote === 1 || currentComment.user_vote === -1 || currentComment.user_vote === 0) 
            ? currentComment.user_vote 
            : 0) as VoteValue,
        };

        // If state has changed since we calculated, skip optimistic update
        // (This means another update already happened)
        if (currentState.userVote !== currentVoteState.userVote ||
            currentState.upvotes !== currentVoteState.upvotes ||
            currentState.downvotes !== currentVoteState.downvotes) {
          return old;
        }

        // Apply optimistic update - REPLACE values, don't add
        return {
          ...old,
          comments: updateCommentById(old.comments, commentId, () => ({
            ...currentComment,
            upvotes: voteChange.newUpvotes,
            downvotes: voteChange.newDownvotes,
            user_vote: voteChange.newUserVote,
          })),
        };
      });

      return { previousReport, expectedUserVote, commentId };
    },
    onSuccess: (data, variables, context) => {
      // Reconciliation: Only update if server response differs from optimistic update
      // This prevents flicker by skipping updates when optimistic update was correct
      queryClient.setQueryData(["report", id], (old: any) => {
        if (!old?.comments) return old;

        const comment = findCommentById(old.comments, data.comment_id);
        if (!comment) return old;

        // Get current state (after optimistic update)
        const currentUserVote: VoteValue = ((comment.user_vote === 1 || comment.user_vote === -1 || comment.user_vote === 0) 
          ? comment.user_vote 
          : 0) as VoteValue;
        const serverUserVote: VoteValue = ((data.user_vote === 1 || data.user_vote === -1 || data.user_vote === 0) 
          ? data.user_vote 
          : 0) as VoteValue;

        // Strict comparison: check if optimistic update exactly matches server response
        const optimisticWasCorrect = 
          context?.expectedUserVote === serverUserVote &&
          currentUserVote === serverUserVote &&
          Number(comment.upvotes) === Number(data.upvotes) &&
          Number(comment.downvotes) === Number(data.downvotes);

        // If optimistic update was correct, return EXACT same object to prevent any re-render
        if (optimisticWasCorrect) {
          return old; // Same reference = no re-render = no flicker
        }

        // Server response differs - check if values actually changed
        const valuesChanged = 
          Number(comment.upvotes) !== Number(data.upvotes) ||
          Number(comment.downvotes) !== Number(data.downvotes) ||
          comment.user_vote !== data.user_vote;

        // If no actual change, return same object to prevent flicker
        if (!valuesChanged) {
          return old;
        }

        // Only create new object if values actually changed
        // This ensures minimal re-renders
        return {
          ...old,
          comments: updateCommentById(old.comments, data.comment_id, () => ({
            ...comment,
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            user_vote: data.user_vote,
          })),
        };
      });
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousReport) {
        queryClient.setQueryData(["report", id], context.previousReport);
      }
      toast({
        title: "Voting failed",
        description: "Try again after a moment.",
        variant: "destructive",
      });
    },
  });

  const handleVote = (value: 1 | -1) => {
    handleReportVote(value);
  };

  const handleCommentSubmit = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Login to join the discussion.",
        variant: "destructive",
      });
      navigate(`/login?redirect=/post/${id}`);
      return;
    }
    if (!commentText.trim()) {
      toast({
        title: "Comment is empty",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate({ text: commentText });
  };

  const handleReplySubmit = (parentId: string) => {
    const replyTextValue = replyText[parentId]?.trim();
    if (!replyTextValue) {
      toast({
        title: "Reply is empty",
        description: "Please write something before posting.",
        variant: "destructive",
      });
      return;
    }
    commentMutation.mutate({ text: replyTextValue, parentId });
  };

  const handleReplyClick = (commentId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Login to reply to comments.",
        variant: "destructive",
      });
      navigate(`/login?redirect=/post/${id}`);
      return;
    }
    setReplyingTo(commentId);
    if (!replyText[commentId]) {
      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
    }
  };

  const handleVoteComment = async (commentId: string, value: 1 | -1) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to vote on comments.",
        variant: "destructive",
      });
      navigate(`/login?redirect=/post/${id}`);
      return;
    }
    commentVoteMutation.mutate({ commentId, value });
  };

  const toggleCommentCollapse = (commentId: string) => {
    setCollapsedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const getReplyCount = (comment: ReportComment): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    let count = comment.replies.length;
    comment.replies.forEach((reply) => {
      count += getReplyCount(reply);
    });
    return count;
  };

  const timeline = useMemo(() => {
    if (!report) return [];
    const currentStatus = (report.status ?? "pending").toLowerCase();
    const currentIndex = statusSteps.findIndex((step) => step.key === currentStatus);
    return statusSteps.map((step, index) => ({
      ...step,
      completed: currentIndex >= index,
      active: currentStatus === step.key,
      date: index === 0 ? formatRelativeTime(report.createdAt) : undefined,
    }));
  }, [report]);

  // Safely derive image-related data before any conditional returns to keep hook order stable
  const imageUrl = report ? extractFirstImage(report.images) : undefined;
  const resolutionPhotos = report?.resolutionPhotos || [];

  // Combine all images for lightbox navigation
  const allImages = useMemo(() => {
    const images: { url: string; alt: string }[] = [];
    if (imageUrl) {
      images.push({ url: imageUrl, alt: report?.title || "Report image" });
    }
    resolutionPhotos.forEach((photo, index) => {
      images.push({ url: photo, alt: `Resolved photo ${index + 1}` });
    });
    return images;
  }, [imageUrl, resolutionPhotos, report?.title]);

  const currentImage = selectedImageIndex !== null ? allImages[selectedImageIndex] : null;

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleNextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < allImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // Keyboard navigation for image lightbox
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      } else if (e.key === "ArrowRight" && selectedImageIndex < allImages.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, allImages.length]);

  const renderComments = (comments?: ReportComment[], depth = 0) => {
    if (!comments?.length) return null;
    return comments.map((comment, index) => {
      const hasReplies = comment.replies && comment.replies.length > 0;
      const isLast = index === comments.length - 1;
      const isCollapsed = collapsedComments.has(comment.id);
      const replyCount = hasReplies ? getReplyCount(comment) : 0;
      
      return (
        <div key={comment.id} className={cn("relative", depth > 0 && "ml-8")}>
          {/* Vertical line connecting to parent - Reddit style */}
          {depth > 0 && (
            <>
              {/* Main vertical line - thinner and more subtle */}
              <div 
                className="absolute -left-8 top-0 w-[1px] bg-muted-foreground/30"
                style={{ 
                  height: isLast && !hasReplies ? '28px' : '100%',
                  top: '28px'
                }}
              />
              {/* Horizontal connector line - thinner */}
              <div 
                className="absolute -left-8 top-[28px] w-8 h-[1px] bg-muted-foreground/30"
              />
            </>
          )}
          
          <div className="relative">
            <CommentItem
              id={comment.id}
              username={comment.author?.username || "Anonymous"}
              text={comment.text}
              timestamp={comment.created_at || new Date().toISOString()}
              updatedAt={comment.updated_at}
              upvotes={comment.upvotes || 0}
              downvotes={comment.downvotes || 0}
              userVote={comment.user_vote || 0}
              authorId={comment.author?.id}
              currentUserId={user?.id}
              depth={depth}
              hasReplies={hasReplies}
              replyCount={replyCount}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => toggleCommentCollapse(comment.id)}
              onUserClick={
                comment.author?.id
                  ? () => navigate(`/user/${comment.author!.id}`)
                  : undefined
              }
              onReply={() => handleReplyClick(comment.id)}
              onVote={handleVoteComment}
              onEdit={commentActions.editComment}
              onDelete={commentActions.deleteComment}
              isEditing={commentActions.isEditingComment}
              isDeleting={commentActions.isDeletingComment}
            />
            
            {/* Reply input for this comment */}
            {replyingTo === comment.id && !isCollapsed && (
              <div className={cn("mb-4 mt-2 space-y-2", depth > 0 ? "ml-10" : "ml-12")}>
                <Textarea
                  placeholder="Write a reply..."
                  rows={3}
                  className="resize-none"
                  value={replyText[comment.id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({ ...prev, [comment.id]: e.target.value }))
                  }
                  disabled={commentMutation.isPending}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={commentMutation.isPending || !replyText[comment.id]?.trim()}
                  >
                    {commentMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Reply"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText((prev) => {
                        const newState = { ...prev };
                        delete newState[comment.id];
                        return newState;
                      });
                    }}
                    disabled={commentMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            {/* Render nested replies - only if not collapsed */}
            {hasReplies && !isCollapsed && (
              <div className="mt-1">
                {renderComments(comment.replies, depth + 1)}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <main className="container mx-auto px-4 py-10 flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Loading report…</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 text-center space-y-4">
          <h1 className="text-2xl font-bold">Report not found</h1>
          <Button onClick={() => navigate("/")}>Return to Home</Button>
        </main>
      </div>
    );
  }

  const categoryLabel = formatCategoryLabel(report.category);
  const locationLabel = formatLocationName(report.location);
  const postedAgo = formatRelativeTime(report.createdAt);
  const reporterName = report.reporter?.username || report.reporterDisplay || "Anonymous";
  const commentsCount = report.comments?.length ?? 0;
  const legitScore = report.aiScore?.legit ?? 0.5;
  const severityScore = report.aiScore?.severity ?? 0.5;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />

        <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-1 pt-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded",
                        reportVoteStateCurrent.userVote === 1 ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                      )}
                      aria-label={reportVoteStateCurrent.userVote === 1 ? "Remove upvote" : "Upvote"}
                      disabled={isVotingReport}
                      onClick={() => handleVote(1)}
                    >
                      <ArrowUp className={cn("w-6 h-6 transition-transform", reportVoteStateCurrent.userVote === 1 && "scale-110")} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{reportVoteStateCurrent.userVote === 1 ? "Remove upvote" : "Upvote"}</p>
                  </TooltipContent>
                </Tooltip>
                <span className={cn(
                  "text-lg font-bold transition-colors duration-200",
                  reportVoteStateCurrent.userVote === 1 && "text-primary",
                  reportVoteStateCurrent.userVote === -1 && "text-destructive",
                  reportVoteStateCurrent.userVote === 0 && "text-muted-foreground"
                )}>
                  {reportVoteStateCurrent.upvotes - reportVoteStateCurrent.downvotes}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={cn(
                        "transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 rounded",
                        reportVoteStateCurrent.userVote === -1 ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive"
                      )}
                      aria-label={reportVoteStateCurrent.userVote === -1 ? "Remove downvote" : "Downvote"}
                      disabled={isVotingReport}
                      onClick={() => handleVote(-1)}
                    >
                      <ArrowDown className={cn("w-6 h-6 transition-transform", reportVoteStateCurrent.userVote === -1 && "scale-110")} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{reportVoteStateCurrent.userVote === -1 ? "Remove downvote" : "Downvote"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">{categoryLabel}</Badge>
                  <StatusPill status={report.status} />
                  {report.reporter?.id === user?.id && report.status === "pending" && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Report options">
                                <MoreVertical className="w-4 h-4" />
                                <span className="sr-only">Report options</span>
                              </Button>
                            </DropdownMenuTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Report options</p>
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold mb-3">{report.title}</h1>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:underline hover:text-primary"
                    onClick={() =>
                      report.reporter?.id && navigate(`/user/${report.reporter.id}`)
                    }
                    disabled={!report.reporter?.id}
                  >
                    <User className="w-4 h-4" />
                    {reporterName}
                  </button>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {postedAgo}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {locationLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Row */}
          <div className="px-4 py-3 border-b border-border bg-accent/30 flex items-center gap-4 text-sm text-muted-foreground">
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors" aria-label="View comments">
                  <MessageSquare className="w-4 h-4" />
                  Comment ({commentsCount})
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View comments</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors" aria-label="Share this post">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share this post</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center gap-1.5 hover:text-primary transition-colors" aria-label="Save for later">
                  <Bookmark className="w-4 h-4" />
                  Save
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save for later</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="ml-auto text-xs flex items-center gap-1 hover:text-foreground"
                  onClick={() => refetch()}
                  aria-label="Refresh post"
                >
                  {isFetching ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-3 h-3" />
                  )}
                  Refresh
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh post</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* AI Assistance */}
          {report.aiScore && (
            <div className="p-4 border-b border-border bg-accent/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">AI Assistance</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          report.aiScore.confidence_label === "very_high" && "bg-green-100 text-green-800 border-green-300",
                          report.aiScore.confidence_label === "high" && "bg-blue-100 text-blue-800 border-blue-300",
                          report.aiScore.confidence_label === "medium" && "bg-yellow-100 text-yellow-800 border-yellow-300",
                          report.aiScore.confidence_label === "low" && "bg-gray-100 text-gray-800 border-gray-300"
                        )}
                      >
                        {report.aiScore.confidence_label 
                          ? report.aiScore.confidence_label.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())
                          : "Medium"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        • Severity{" "}
                        <span className="font-semibold text-foreground">
                          {Math.round(severityScore * 100)}%
                        </span>
                      </span>
                    </div>
                    {report.aiScore.explanation && (
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <ChevronDown className="w-3 h-3" />
                            Why this score?
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <p className="text-sm text-muted-foreground mt-1 pl-4">
                            {report.aiScore.explanation}
                          </p>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Original Image */}
          {imageUrl && (
            <button
              type="button"
              onClick={() => handleImageClick(0)}
              className="w-full cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src={imageUrl}
                alt={report.title}
                className="w-full max-h-[500px] object-cover"
              />
            </button>
          )}

          {/* Resolution Photos (if any) */}
          {resolutionPhotos.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-3">Resolved photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {resolutionPhotos.map((photo, index) => (
                  <button
                    key={index}
                    type="button"
                    className="relative aspect-video overflow-hidden rounded-md border bg-muted hover:opacity-90 transition-opacity cursor-pointer"
                    onClick={() => handleImageClick(imageUrl ? index + 1 : index)}
                  >
                    <img
                      src={photo}
                      alt={`Resolved photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="p-4 border-b border-border">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {report.description}
            </p>
          </div>

          {/* Timeline */}
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold mb-4">Progress Timeline</h3>
            <div className="space-y-3">
              {timeline.map((item, index) => (
                <div key={item.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full border-2",
                        item.completed
                          ? "bg-primary border-primary"
                          : "bg-background border-muted"
                      )}
                    />
                    {index < timeline.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 h-8",
                          item.completed ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        item.completed ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              Comments
              <span className="text-sm font-normal text-muted-foreground">
                ({commentsCount})
              </span>
            </h2>

            <div className="max-h-[60vh] md:max-h-none overflow-y-auto overflow-x-hidden mb-4 pr-2 scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="space-y-4 pb-24 md:pb-4">{renderComments(report.comments)}</div>
            </div>
            
            <div className="sticky bottom-20 md:bottom-4 bg-background border border-border rounded-lg p-3 space-y-2 z-10">
              <Textarea
                placeholder={
                  isAuthenticated ? "Add a comment…" : "Login to add a comment"
                }
                rows={3}
                className="resize-none"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!isAuthenticated || commentMutation.isPending}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={handleCommentSubmit}
                disabled={commentMutation.isPending}
              >
                {commentMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting…
                  </>
                ) : (
                  "Post Comment"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {report && (
        <>
          <EditReportModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            report={report}
            onSave={reportActions.updateReport}
            isSaving={reportActions.isUpdating}
          />
        </>
      )}

      {/* Image Lightbox Modal */}
      <Dialog open={selectedImageIndex !== null} onOpenChange={(open) => !open && setSelectedImageIndex(null)}>
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-black/95 border-none [&>button]:hidden">
          <DialogTitle className="sr-only">Image viewer</DialogTitle>
          <DialogDescription className="sr-only">
            Use arrow keys or on-screen controls to navigate images. Press close to exit.
          </DialogDescription>
          {currentImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <button
                onClick={() => setSelectedImageIndex(null)}
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Previous Button */}
              {selectedImageIndex !== null && selectedImageIndex > 0 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 z-50 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}
              
              {/* Next Button */}
              {selectedImageIndex !== null && selectedImageIndex < allImages.length - 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 z-50 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}
              
              {/* Image */}
              <img
                src={currentImage.url}
                alt={currentImage.alt}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                  {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {allImages.length}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
      </div>
    </TooltipProvider>
  );
};

export default PostDetail;
