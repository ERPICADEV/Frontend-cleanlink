import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentItemProps {
  username: string;
  text: string;
  timestamp: string;
  upvotes?: number;
  onReply?: () => void;
}

const CommentItem = ({
  username,
  text,
  timestamp,
  upvotes = 0,
  onReply,
}: CommentItemProps) => {
  return (
    <div className="border-l-2 border-border pl-3 py-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-sm">{username}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">{timestamp}</span>
      </div>
      <p className="text-sm text-foreground mb-2">{text}</p>
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
    </div>
  );
};

export default CommentItem;
