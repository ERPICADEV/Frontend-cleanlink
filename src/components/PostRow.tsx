import { ChevronUp, ChevronDown, MessageSquare, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  category: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  timeAgo: string;
}

interface PostRowProps {
  post: Post;
  onClick: () => void;
}

const PostRow = ({ post, onClick }: PostRowProps) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Garbage: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
      Road: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      Water: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
      Trees: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
      Electricity: "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",
      Other: "bg-muted text-muted-foreground",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="border-b border-border bg-card hover:bg-accent/30 transition-colors">
      <div className="flex gap-2 p-3 sm:p-4">
        {/* Upvote Column */}
        <div className="flex flex-col items-center gap-0.5 pt-1 w-10 flex-shrink-0">
          <button 
            className="p-1.5 hover:bg-accent rounded transition-colors touch-manipulation"
            aria-label="Upvote"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold tabular-nums">{post.upvotes}</span>
          <button 
            className="p-1.5 hover:bg-accent rounded transition-colors touch-manipulation"
            aria-label="Downvote"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <h3 className="font-semibold text-base mb-1.5 line-clamp-2 leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2.5 leading-relaxed">
            {post.description}
          </p>
          
          {/* Meta Row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <span className={cn(
              "px-2 py-0.5 rounded-full font-medium",
              getCategoryColor(post.category)
            )}>
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{post.location}</span>
            </span>
            <span>•</span>
            <span>{post.timeAgo}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {post.commentCount}
            </span>
          </div>
        </div>

        {/* Thumbnail */}
        {post.imageUrl && (
          <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
            <img
              src={post.imageUrl}
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
