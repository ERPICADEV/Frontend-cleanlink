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
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import StatusPill from "@/components/StatusPill";
import CommentItem from "@/components/CommentItem";
import { EditReportModal } from "@/components/EditReportModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  createComment,
  fetchReportDetail,
  type ReportComment,
  type ReportDetail,
  voteOnReport,
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
  });

  const voteMutation = useMutation({
    mutationFn: (value: 1 | -1) => voteOnReport(id!, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["report", id] }),
    onError: () => {
      toast({
        title: "Voting failed",
        description: "Try again after a moment.",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: () => createComment(id!, { text: commentText }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      toast({
        title: "Comment posted",
        description: "Thanks for adding more context!",
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

  const handleVote = (value: 1 | -1) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to vote on reports.",
        variant: "destructive",
      });
      navigate(`/login?redirect=/post/${id}`);
      return;
    }
    voteMutation.mutate(value);
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
    commentMutation.mutate();
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
    return comments.map((comment) => (
      <div key={comment.id} className={cn({ "ml-4": depth > 0 })}>
        <CommentItem
          id={comment.id}
          username={comment.author?.username || "Anonymous"}
          text={comment.text}
          timestamp={comment.created_at ? formatRelativeTime(comment.created_at) : "Recently"}
          updatedAt={comment.updated_at ? formatRelativeTime(comment.updated_at) : undefined}
          authorId={comment.author?.id}
          currentUserId={user?.id}
          onUserClick={
            comment.author?.id
              ? () => navigate(`/user/${comment.author!.id}`)
              : undefined
          }
          onEdit={commentActions.editComment}
          onDelete={commentActions.deleteComment}
          isEditing={commentActions.isEditingComment}
          isDeleting={commentActions.isDeletingComment}
        />
        {renderComments(comment.replies, depth + 1)}
      </div>
    ));
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
                <button
                  className="text-muted-foreground hover:text-primary transition-colors active:scale-95"
                  aria-label="Upvote"
                  disabled={voteMutation.isPending}
                  onClick={() => handleVote(1)}
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <span className="text-lg font-bold">{report.upvotes}</span>
                <button
                  className="text-muted-foreground hover:text-destructive transition-colors active:scale-95"
                  aria-label="Downvote"
                  disabled={voteMutation.isPending}
                  onClick={() => handleVote(-1)}
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">{categoryLabel}</Badge>
                  <StatusPill status={report.status} />
                  {report.reporter?.id === user?.id && report.status === "pending" && (
                    <div className="ml-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                            <span className="sr-only">Report options</span>
                          </Button>
                        </DropdownMenuTrigger>
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
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" />
              Comment ({commentsCount})
            </button>
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Bookmark className="w-4 h-4" />
              Save
            </button>
            <button
              className="ml-auto text-xs flex items-center gap-1 hover:text-foreground"
              onClick={() => refetch()}
            >
              {isFetching ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCcw className="w-3 h-3" />
              )}
              Refresh
            </button>
          </div>

          {/* AI Summary */}
          {report.aiScore && (
            <div className="p-4 border-b border-border bg-accent/20">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">AI insight</h3>
                  <p className="text-sm text-muted-foreground">
                    Legitimacy{" "}
                    <span className="font-semibold text-foreground">
                      {Math.round(legitScore * 100)}%
                    </span>{" "}
                    • Severity{" "}
                    <span className="font-semibold text-foreground">
                      {Math.round(severityScore * 100)}%
                    </span>
                  </p>
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

            <div className="space-y-4 mb-4">{renderComments(report.comments)}</div>
            
            <div className="sticky bottom-20 md:bottom-4 bg-background border border-border rounded-lg p-3 space-y-2">
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
  );
};

export default PostDetail;
