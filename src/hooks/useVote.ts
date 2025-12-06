/**
 * Reusable hook for voting functionality
 * Implements Reddit-style voting: click same button = remove vote, click opposite = change vote
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export type VoteValue = 1 | -1 | 0;

export interface VoteState {
  upvotes: number;
  downvotes: number;
  userVote: VoteValue;
}

export interface VoteResult {
  newUpvotes: number;
  newDownvotes: number;
  newUserVote: VoteValue;
}

/**
 * Calculate new vote state (matches backend logic)
 * Reddit-style: click same button = remove vote, click opposite = change vote
 */
export function calculateVoteChange(
  currentState: VoteState,
  voteValue: 1 | -1
): VoteResult {
  const { upvotes, downvotes, userVote } = currentState;

  // Reddit-style: click same = remove, click opposite = change
  if (userVote === voteValue) {
    // Remove vote
    return {
      newUpvotes: Math.max(0, upvotes - (voteValue === 1 ? 1 : 0)),
      newDownvotes: Math.max(0, downvotes - (voteValue === -1 ? 1 : 0)),
      newUserVote: 0,
    };
  } else if (userVote !== 0) {
    // Change vote
    const afterRemove = {
      upvotes: userVote === 1 ? Math.max(0, upvotes - 1) : upvotes,
      downvotes: userVote === -1 ? Math.max(0, downvotes - 1) : downvotes,
    };
    return {
      newUpvotes: voteValue === 1 ? afterRemove.upvotes + 1 : afterRemove.upvotes,
      newDownvotes: voteValue === -1 ? afterRemove.downvotes + 1 : afterRemove.downvotes,
      newUserVote: voteValue,
    };
  } else {
    // New vote
    return {
      newUpvotes: voteValue === 1 ? upvotes + 1 : upvotes,
      newDownvotes: voteValue === -1 ? downvotes + 1 : downvotes,
      newUserVote: voteValue,
    };
  }
}

interface UseVoteOptions {
  entityId: string;
  currentState: VoteState;
  voteFn: (id: string, value: 1 | -1) => Promise<any>;
  queryKey: readonly unknown[];
  updateCache: (old: any, result: VoteResult) => any;
  getCurrentState: (data: any) => VoteState;
  requireAuth?: boolean;
  authRedirect?: string;
}

/**
 * Reusable hook for voting with optimistic updates
 * Prevents double-counting by reading current state from cache and replacing with server response
 */
export function useVote({
  entityId,
  currentState,
  voteFn,
  queryKey,
  updateCache,
  getCurrentState,
  requireAuth = true,
  authRedirect,
}: UseVoteOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (value: 1 | -1) => voteFn(entityId, value),
    onMutate: async (value) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value for rollback
      const previousData = queryClient.getQueryData(queryKey);

      // Read current state from cache (source of truth), fallback to prop if cache is empty
      const cachedData = queryClient.getQueryData(queryKey);
      const actualCurrentState = cachedData 
        ? getCurrentState(cachedData) 
        : currentState;

      // Calculate optimistic update based on actual current state from cache
      const voteChange = calculateVoteChange(actualCurrentState, value);

      // Optimistically update cache with calculated deltas
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return updateCache(old, voteChange);
      });

      return { previousData, voteChange };
    },
    onSuccess: (data) => {
      // Replace with server's authoritative response (absolute values, not deltas)
      // Use updateCache to ensure proper structure handling (works for both single objects and infinite queries)
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        // Server returns absolute values - pass as VoteResult to updateCache for replacement
        return updateCache(old, {
          newUpvotes: data.upvotes,
          newDownvotes: data.downvotes,
          newUserVote: data.user_vote,
        });
      });
    },
    onError: (error, variables, context) => {
      // Revert on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast({
        title: 'Voting failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleVote = (value: 1 | -1) => {
    if (requireAuth && !isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to vote',
        variant: 'destructive',
      });
      if (authRedirect) {
        navigate(authRedirect);
      }
      return;
    }

    mutation.mutate(value);
  };

  // Return currentState prop (component will re-render when query updates via useQuery)
  // The prop is derived from reactive query data, so it will be up-to-date
  return {
    handleVote,
    isVoting: mutation.isPending,
    currentState,
  };
}

