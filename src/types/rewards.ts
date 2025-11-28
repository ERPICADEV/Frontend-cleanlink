export interface Reward {
  id: string;
  key: string;
  title: string;
  description: string;
  requiredPoints: number;
  availableFrom?: string | null;
  availableUntil?: string | null;
  maxPerUser: number;
  metadata: Record<string, any>;
}

export interface Redemption {
  id: string;
  reward: {
    title: string;
    description: string;
    points_required: number;
  };
  status: "requested" | "approved" | "rejected";
  points_deducted: number;
  created_at: string;
}


