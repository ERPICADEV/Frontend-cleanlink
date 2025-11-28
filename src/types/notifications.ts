export type NotificationType = "report_resolved" | "level_up" | "points_earned" | string;

export interface Notification {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  paging?: {
    next_cursor?: string;
  } | null;
}


