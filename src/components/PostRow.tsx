import { ArrowUp, ArrowDown, MessageSquare, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
      Garbage: "bg-orange-500/10 text-orange-700 border-orange-200",
      Road: "bg-blue-500/10 text-blue-700 border-blue-200",
      Water: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
      Trees: "bg-green-500/10 text-green-700 border-green-200",
      Electricity: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      Other: "bg-gray-500/10 text-gray-700 border-gray-200",
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="flex gap-2 py-3 px-2 hover:bg-accent/50 border-b border-separator transition-colors">
      {/* Upvote/Downvote Column */}
      <div className="flex flex-col items-center gap-1 w-10 pt-1">
        <button className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowUp className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium">{post.upvotes}</span>
        <button className="text-muted-foreground hover:text-destructive transition-colors">
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      {/* Thumbnail (if exists) */}
      {post.imageUrl && (
        <div className="w-20 h-20 flex-shrink-0">
          <img
            src={post.imageUrl}
            alt=""
            className="w-full h-full object-cover rounded"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <h3 className="text-base font-medium text-foreground hover:text-primary mb-1">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {post.description}
        </p>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <Badge variant="outline" className={getCategoryColor(post.category)}>
            {post.category}
          </Badge>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {post.location}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {post.commentCount} comments
          </span>
          <span>{post.timeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default PostRow;
