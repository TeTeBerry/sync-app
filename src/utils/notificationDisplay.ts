import type { TFunction } from "i18next";
import type { AppNotification, NotificationMeta } from "../types/backend";

export type NotificationCategory =
  | "comment"
  | "like"
  | "system"
  | "general";

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

function resolveTemplateKey(meta?: NotificationMeta): string | null {
  const key = meta?.templateKey?.trim();
  if (!key) return null;
  return key.startsWith("notifications.types.")
    ? key.slice("notifications.types.".length)
    : key;
}

export function resolveNotificationText(
  item: AppNotification,
  t: TFunction,
): { title: string; body: string; category: NotificationCategory } {
  const category = getNotificationCategory(item.meta);
  const templateKey = resolveTemplateKey(item.meta);
  const params = {
    actor: item.meta?.actorUserName?.trim() || t("notifications.someone"),
    ...item.meta?.templateParams,
  };

  if (templateKey) {
    const titleKey = `notifications.types.${templateKey}.title`;
    const bodyKey = `notifications.types.${templateKey}.body`;
    const localizedTitle = t(titleKey, params);
    const localizedBody = t(bodyKey, params);

    if (localizedTitle !== titleKey && localizedBody !== bodyKey) {
      return {
        title: localizedTitle,
        body: localizedBody,
        category,
      };
    }
  }

  return {
    title: item.title,
    body: item.body,
    category,
  };
}

export function formatNotificationTimeAgo(iso: string, t: TFunction): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t("notifications.time.justNow");
  if (minutes < 60) return t("notifications.time.minutesAgo", { count: minutes });

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("notifications.time.hoursAgo", { count: hours });

  const days = Math.floor(hours / 24);
  return t("notifications.time.daysAgo", { count: days });
}
