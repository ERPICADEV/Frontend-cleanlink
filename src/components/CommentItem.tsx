import React, { useState, useRef, useEffect, memo } from "react";
import { ArrowUp, ArrowDown, MoreVertical, Edit, Trash2, X, Check, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CommentItemProps {
  id: string;
  username: string;
  text: string;
  timestamp: string; // ISO timestamp string
  updatedAt?: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: number;
  authorId?: string;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onReply?: () => void;
  onVote?: (commentId: string, value: 1 | -1) => Promise<void>;
  onUserClick?: () => void;
  onEdit?: (commentId: string, text: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  isEditing?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
  depth?: number;
  hasReplies?: boolean;
  replyCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const CommentItem = ({
  id,
  username,
  text,
  timestamp,
  updatedAt,
  upvotes = 0,
  downvotes = 0,
  userVote = 0,
  authorId,
  currentUserId,
  isAdmin = false,
  onReply,
  onVote,
  onUserClick,
  onEdit,
  onDelete,
  isEditing: externalIsEditing = false,
  isDeleting: externalIsDeleting = false,
  disabled = false,
  depth = 0,
  hasReplies = false,
  replyCount = 0,
  isCollapsed = false,
  onToggleCollapse,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(downvotes);
  const [localUserVote, setLocalUserVote] = useState(userVote);
  const [isVoting, setIsVoting] = useState(false);
  const [displayTime, setDisplayTime] = useState(formatRelativeTime(timestamp));
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when props change - use ref to track previous values
  // This prevents flicker by only updating when values actually change
  const prevValuesRef = useRef({ upvotes, downvotes, userVote });
  
  useEffect(() => {
    const prev = prevValuesRef.current;
    // Only update if values actually changed
    if (prev.upvotes !== upvotes) {
      setLocalUpvotes(upvotes);
      prevValuesRef.current.upvotes = upvotes;
    }
    if (prev.downvotes !== downvotes) {
      setLocalDownvotes(downvotes);
      prevValuesRef.current.downvotes = downvotes;
    }
    if (prev.userVote !== userVote) {
      setLocalUserVote(userVote);
      prevValuesRef.current.userVote = userVote;
    }
  }, [upvotes, downvotes, userVote]);

  // Update timestamp display every minute for real-time updates
  useEffect(() => {
    const updateTime = () => {
      setDisplayTime(formatRelativeTime(timestamp));
    };
    
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [timestamp]);

  const canEdit = (authorId && currentUserId && authorId === currentUserId) || isAdmin;
  const isEdited = updatedAt && updatedAt !== timestamp;
  const isLocalEditing = isEditing || externalIsEditing;
  const isLocalDeleting = externalIsDeleting;

  useEffect(() => {
    if (isLocalEditing && textareaRef.current) {
      textareaRef.current.focus();
      // Set cursor to end
      const length = editText.length;
      textareaRef.current.setSelectionRange(length, length);
    }
  }, [isLocalEditing, editText.length]);

  const handleEditClick = () => {
    setEditText(text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim() || editText.length > 1000) {
      return;
    }
    if (onEdit) {
      await onEdit(id, editText);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (onDelete) {
      await onDelete(id);
      setShowDeleteDialog(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      handleCancelEdit();
    } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit();
    }
  };

  const handleVote = async (value: 1 | -1) => {
    if (!onVote || isVoting || disabled) return;
    
    setIsVoting(true);
    try {
      // Let the parent mutation handle optimistic updates
      // This component just calls onVote and syncs with props via useEffect
      await onVote(id, value);
    } catch (error) {
      // Error handling is done in the parent mutation
      console.error('Vote error:', error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <TooltipProvider>
      <>
        <div className="flex gap-2 py-1">
          {/* Collapse/Expand Button - Reddit style with greyish background */}
          {hasReplies && onToggleCollapse && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-muted hover:bg-muted-foreground/20 rounded-full border border-border transition-all mt-0.5 active:scale-95"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse();
                  }}
                  aria-label={isCollapsed ? "Expand comment thread" : "Collapse comment thread"}
                >
                  {isCollapsed ? (
                    <Plus className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.5} />
                  ) : (
                    <Minus className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.5} />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCollapsed ? "Expand comment thread" : "Collapse comment thread"}</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          {/* Spacer when no collapse button */}
          {(!hasReplies || !onToggleCollapse) && <div className="w-5" />}
          
          {/* Voting UI - Reddit style */}
          <div className="flex flex-col items-center gap-0.5 pt-1 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "transition-all duration-200 active:scale-95 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    localUserVote === 1 ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
                  )}
                  aria-label={localUserVote === 1 ? "Remove upvote" : "Upvote"}
                  disabled={isVoting || disabled || !onVote}
                  onClick={() => handleVote(1)}
                >
                  <ArrowUp className={cn("w-4 h-4 transition-transform", localUserVote === 1 && "scale-110")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{localUserVote === 1 ? "Remove upvote" : "Upvote"}</p>
              </TooltipContent>
            </Tooltip>
            <span className={cn(
              "text-xs font-medium min-w-[2ch] text-center leading-none transition-colors duration-200",
              localUserVote === 1 && "text-primary",
              localUserVote === -1 && "text-destructive",
              localUserVote === 0 && "text-muted-foreground"
            )}>
              {localUpvotes - localDownvotes}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "transition-all duration-200 active:scale-95 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-1",
                    localUserVote === -1 ? "text-destructive bg-destructive/10" : "text-muted-foreground hover:text-destructive"
                  )}
                  aria-label={localUserVote === -1 ? "Remove downvote" : "Downvote"}
                  disabled={isVoting || disabled || !onVote}
                  onClick={() => handleVote(-1)}
                >
                  <ArrowDown className={cn("w-4 h-4 transition-transform", localUserVote === -1 && "scale-110")} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{localUserVote === -1 ? "Remove downvote" : "Downvote"}</p>
              </TooltipContent>
            </Tooltip>
          </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0 group">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <button
              type="button"
              className="font-medium text-sm hover:underline hover:text-primary"
              onClick={onUserClick}
              disabled={!onUserClick}
            >
              {username}
            </button>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{displayTime}</span>
            {isEdited && (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground italic">(edited)</span>
              </>
            )}
            {canEdit && !isLocalEditing && (
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                          aria-label="Comment options"
                        >
                          <MoreVertical className="w-3 h-3" />
                          <span className="sr-only">Comment options</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Comment options</p>
                    </TooltipContent>
                  </Tooltip>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={handleEditClick}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={handleDeleteClick}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {isLocalEditing ? (
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none min-h-[80px]"
                maxLength={1000}
                disabled={isLocalDeleting || disabled}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {editText.length}/1000 characters
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isLocalDeleting || disabled}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={
                      !editText.trim() ||
                      editText.length > 1000 ||
                      editText === text ||
                      isLocalDeleting ||
                      disabled
                    }
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Press Ctrl+Enter to save, Esc to cancel
              </p>
            </div>
          ) : (
            <>
              {isCollapsed ? (
                <div className="text-sm text-muted-foreground mb-2 py-1">
                  <span className="italic">Comment collapsed. </span>
                  {replyCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleCollapse?.();
                      }}
                      className="text-primary hover:underline font-medium"
                    >
                      {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-foreground mb-2 whitespace-pre-wrap break-words leading-relaxed">{text}</p>
                  <div className="flex items-center gap-3">
                    {onReply && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-primary font-medium"
                        onClick={onReply}
                        disabled={disabled}
                      >
                        Reply
                      </Button>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      </>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLocalDeleting}
            >
              {isLocalDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};

const areEqual = (prev: CommentItemProps, next: CommentItemProps) => {
  return (
    prev.id === next.id &&
    prev.username === next.username &&
    prev.text === next.text &&
    prev.timestamp === next.timestamp &&
    prev.updatedAt === next.updatedAt &&
    prev.upvotes === next.upvotes &&
    prev.downvotes === next.downvotes &&
    prev.userVote === next.userVote &&
    prev.authorId === next.authorId &&
    prev.currentUserId === next.currentUserId &&
    prev.isAdmin === next.isAdmin &&
    prev.isEditing === next.isEditing &&
    prev.isDeleting === next.isDeleting &&
    prev.disabled === next.disabled &&
    prev.depth === next.depth &&
    prev.hasReplies === next.hasReplies &&
    prev.replyCount === next.replyCount &&
    prev.isCollapsed === next.isCollapsed &&
    prev.onReply === next.onReply &&
    prev.onVote === next.onVote &&
    prev.onUserClick === next.onUserClick &&
    prev.onEdit === next.onEdit &&
    prev.onDelete === next.onDelete &&
    prev.onToggleCollapse === next.onToggleCollapse
  );
};

export default memo(CommentItem, areEqual);
