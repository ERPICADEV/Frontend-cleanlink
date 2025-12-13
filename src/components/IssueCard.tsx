import { ArrowUp, ArrowDown, MapPin, Clock } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { voteOnReport } from "@/services/reportService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  imageUrl: string;
  upvotes: number;
  downvotes: number;
  reporterName: string;
  timeAgo: string;
}

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

const IssueCard = ({ issue, onClick }: IssueCardProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const voteMutation = useMutation({
    mutationFn: (value: 1 | -1) => voteOnReport(issue.id, value),
    onMutate: async (value) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reports'] });
      
      // Snapshot the previous value
      const previousReports = queryClient.getQueryData(['reports']);
      
      // Optimistically update the UI
      queryClient.setQueryData(['reports'], (old: any) => {
        if (!old?.pages) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((report: any) =>
              report.id === issue.id
                ? {
                    ...report,
                    upvotes: value === 1 ? report.upvotes + 1 : report.upvotes,
                    downvotes: value === -1 ? report.downvotes + 1 : report.downvotes,
                  }
                : report
            ),
          })),
        };
      });
      
      return { previousReports };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['reports'], context?.previousReports);
      toast({
        title: "Voting failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure sync with server
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Garbage: "bg-orange-100 text-orange-800 border-orange-200",
      Road: "bg-blue-100 text-blue-800 border-blue-200",
      Water: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Trees: "bg-green-100 text-green-800 border-green-200",
      Electricity: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Other: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[category] || colors.Other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "High Priority": "bg-red-100 text-red-800 border-red-200",
      Cleaned: "bg-green-100 text-green-800 border-green-200",
      Rejected: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || colors.Pending;
  };

  return (
    <TooltipProvider>
      <Card
        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={onClick}
      >
      <div className="flex gap-4 p-4">
        <img
          src={issue.imageUrl}
          alt={issue.title}
          className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base line-clamp-1">{issue.title}</h3>
            <Badge variant="outline" className={getStatusColor(issue.status)}>
              {issue.status}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {issue.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{issue.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{issue.timeAgo}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className={getCategoryColor(issue.category)}>
              {issue.category}
            </Badge>

            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-1"
                    onClick={(e) => handleVote(1, e)}
                    disabled={voteMutation.isPending}
                    aria-label="Upvote"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-xs">{issue.upvotes}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upvote</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-1"
                    onClick={(e) => handleVote(-1, e)}
                    disabled={voteMutation.isPending}
                    aria-label="Downvote"
                  >
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-xs">{issue.downvotes}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Downvote</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Reported by {issue.reporterName}
          </div>
        </div>
      </div>
    </Card>
    </TooltipProvider>
  );
};

export default IssueCard;