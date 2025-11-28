import apiClient from "@/lib/apiClient";

export interface ReportLocation {
  lat?: number;
  lng?: number;
  area_name?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  [key: string]: string | number | undefined;
}

export interface ReportSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  images?: unknown;
  location?: ReportLocation | null;
  visibility: string;
  upvotes: number;
  downvotes: number;
  communityScore: number;
  status: string;
  createdAt: string;
  reporterDisplay: string;
  comments_count: number;
  description_preview: string;
}

export interface CommentAuthor {
  id?: string;
  username?: string | null;
  badges?: string[];
}

export interface ReportComment {
  id: string;
  text: string;
  author: CommentAuthor;
  parent_comment_id?: string | null;
  created_at: string;
  updated_at: string;
  replies?: ReportComment[];
  reportId?: string;
  reportTitle?: string;
}

export interface UserComment extends ReportComment {
  reportId: string;
  reportTitle: string;
}

export interface UserCommentsResponse {
  data: UserComment[];
  total: number;
  limit: number;
  offset: number;
}

export interface AIScore {
  legit?: number;
  severity?: number;
  duplicate_prob?: number;
  insights?: string[];
  [key: string]: unknown;
}

export interface ReportDetail extends ReportSummary {
  reporter?: {
    id?: string;
    username?: string | null;
    email?: string | null;
  } | null;
  comments?: ReportComment[];
  aiScore?: AIScore | null;
  flags?: Record<string, unknown>;
  duplicateOf?: string | null;
  mcdResolution?: Record<string, unknown>;
  mcdVerifiedBy?: string | null;
}

export interface ReportListResponse {
  data: ReportSummary[];
  paging?: {
    next_cursor?: string;
  } | null;
}

export interface ReportImagePayload {
  url?: string;
  name?: string;
  [key: string]: string | undefined;
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category: string;
  location: ReportLocation & { visibility?: string };
  images?: string[]; // Change to array of URLs, not base64 data
  anonymous?: boolean;
  client_idempotency_key?: string;
}


export interface CreateReportResponse {
  id: string;
  status: string;
  ai_check?: string;
  created_at: string;
  points_awarded: number;
}

export const fetchReports = async (params?: {
  category?: string;
  status?: string;
  sort?: "new" | "hot" | "top";
  limit?: number;
  cursor?: string;
  reporter_id?: string;
}) => {
  const { data } = await apiClient.get<ReportListResponse>("/reports", {
    params,
  });
  return data;
};

export const fetchReportDetail = async (id: string) => {
  const { data } = await apiClient.get<ReportDetail>(`/reports/${id}`);
  return data;
};

export const createReport = async (payload: CreateReportPayload) => {
  const { data } = await apiClient.post<CreateReportResponse>("/reports", payload);
  return data;
};

export const uploadImage = async (file: File): Promise<string> => {
  // For now, we'll use a placeholder service
  // In production, you'd upload to S3/Cloudinary/your own server
  return new Promise((resolve) => {
    // Simulate upload and return a placeholder URL
    const fakeUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
    setTimeout(() => resolve(fakeUrl), 1000);
  });
};
export interface VoteResponse {
  report_id: string;
  upvotes: number;
  downvotes: number;
  score: number;
  user_vote: number;
}

export const voteOnReport = async (id: string, value: 1 | -1) => {
  const { data } = await apiClient.post<VoteResponse>(`/reports/${id}/vote`, { value });
  return data;
};

export const createComment = async (
  reportId: string,
  payload: { text: string; parent_comment_id?: string }
) => {
  const { data } = await apiClient.post(`/reports/${reportId}/comments`, payload);
  return data as ReportComment;
};

export const updateComment = async (commentId: string, text: string) => {
  const { data } = await apiClient.patch<ReportComment>(`/reports/comments/${commentId}`, { text });
  return data;
};

export const deleteComment = async (commentId: string) => {
  const { data } = await apiClient.delete<{ message: string }>(`/reports/comments/${commentId}`);
  return data;
};

export interface ReportUpdateData {
  title?: string;
  description?: string;
  category?: string;
  images?: string[];
  location?: ReportLocation;
}

export const updateReport = async (reportId: string, updates: ReportUpdateData) => {
  const { data } = await apiClient.patch<ReportDetail>(`/reports/${reportId}`, updates);
  return data;
};

export const fetchUserComments = async (params?: {
  limit?: number;
  offset?: number;
}) => {
  const { data } = await apiClient.get<UserCommentsResponse>("/users/me/comments", {
    params,
  });
  return data;
};

export interface MapFeature {
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    title: string;
    category: string;
    status: string;
    area_name?: string;
    upvotes: number;
    downvotes: number;
    created_at: string;
    reporter: string;
    ai_confidence?: number;
    severity?: number;
    image_count: number;
    color?: string;
    icon?: string;
  };
  type: string;
}

export const fetchMapReports = async (params?: {
  bounds?: string;
  category?: string;
  status?: string;
  limit?: number;
}) => {
  const { data } = await apiClient.get<{ features: MapFeature[] }>(
    "/map/reports",
    { params }
  );
  return data.features;
};

