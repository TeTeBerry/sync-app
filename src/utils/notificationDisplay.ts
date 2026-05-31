import type { AppNotification, NotificationMeta } from "../types/backend";

export type NotificationCategory = "comment" | "like" | "system" | "general";

export function getNotificationCategory(meta?: NotificationMeta): NotificationCategory {
  const type = meta?.type;
  if (type === "like") return "like";
  if (type === "comment" || type === "comment_reply") return "comment";
  if (
    type === "activity_update" ||
    type === "post_rejected" ||
    type === "post_hidden" ||
    type === "activity"
  ) {
    return "system";
  }
  return "general";
}

export function resolveNotificationText(item: AppNotification): {
  title: string;
  body: string;
  category: NotificationCategory;
} {
  const category = getNotificationCategory(item.meta);
  return {
    title: item.title,
    body: item.body,
    category,
  };
}

export function formatNotificationTimeAgo(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;

  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}
