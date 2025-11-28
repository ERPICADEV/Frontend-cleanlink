import { useState, useRef, useEffect } from "react";
import { ArrowUp, MoreVertical, Edit, Trash2, X, Check } from "lucide-react";
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

interface CommentItemProps {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  updatedAt?: string;
  upvotes?: number;
  authorId?: string;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onReply?: () => void;
  onUserClick?: () => void;
  onEdit?: (commentId: string, text: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  isEditing?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
}

const CommentItem = ({
  id,
  username,
  text,
  timestamp,
  updatedAt,
  upvotes = 0,
  authorId,
  currentUserId,
  isAdmin = false,
  onReply,
  onUserClick,
  onEdit,
  onDelete,
  isEditing: externalIsEditing = false,
  isDeleting: externalIsDeleting = false,
  disabled = false,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <>
      <div className="border-l-2 border-border pl-3 py-2 group">
        <div className="flex items-center gap-2 mb-1">
          <button
            type="button"
            className="font-medium text-sm hover:underline hover:text-primary"
            onClick={onUserClick}
            disabled={!onUserClick}
          >
            {username}
          </button>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          {isEdited && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            </>
          )}
          {canEdit && !isLocalEditing && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3 h-3" />
                    <span className="sr-only">Comment options</span>
                  </Button>
                </DropdownMenuTrigger>
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
            <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">{text}</p>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                <ArrowUp className="w-3 h-3" />
                <span>{upvotes}</span>
              </button>
              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                  onClick={onReply}
                >
                  Reply
                </Button>
              )}
            </div>
          </>
        )}
      </div>

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
    </>
  );
};

export default CommentItem;
