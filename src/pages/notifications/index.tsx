import "./notifications.scss";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { BellIcon } from "lucide-react";
import PageNavigation from "../../components/PageNavigation";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotificationsQuery,
} from "../../hooks/useSyncApi";
import type { AppNotification } from "../../types/backend";
import { ROUTES } from "../../utils/route";

function formatTimeAgo(iso: string, locale: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return locale.startsWith("zh") ? "刚刚" : locale.startsWith("th") ? "เมื่อสักครู่" : "Just now";
  if (minutes < 60) {
    return locale.startsWith("zh")
      ? `${minutes} 分钟前`
      : locale.startsWith("th")
        ? `${minutes} นาทีที่แล้ว`
        : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale.startsWith("zh")
      ? `${hours} 小时前`
      : locale.startsWith("th")
        ? `${hours} ชม. ที่แล้ว`
        : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return locale.startsWith("zh")
    ? `${days} 天前`
    : locale.startsWith("th")
      ? `${days} วันที่แล้ว`
      : `${days}d ago`;
}

function notificationIcon() {
  return BellIcon;
}

function notificationIconClass(): string {
  return "s-notifications__icon";
}

function resolveNotificationText(
  item: AppNotification,
  t: (key: string, options?: Record<string, unknown>) => string,
): { title: string; body: string } {
  const meta = item.meta ?? {};
  const actor = meta.actorUserName || meta.actorUserId || t("notifications.someone");

  switch (item.type) {
    case "pindan_join_leader":
      return {
        title: t("notifications.types.pindanJoinLeader.title"),
        body: t("notifications.types.pindanJoinLeader.body", {
          actor,
          title: meta.pindanTitle ?? t("notifications.pindanFallback"),
        }),
      };
    case "pindan_join_member":
      return {
        title: t("notifications.types.pindanJoinMember.title"),
        body: t("notifications.types.pindanJoinMember.body", {
          title: meta.pindanTitle ?? t("notifications.pindanFallback"),
        }),
      };
    case "ticket_match":
      return {
        title: t("notifications.types.ticketMatch.title"),
        body: t("notifications.types.ticketMatch.body", {
          event: meta.displayEventName ?? meta.activityId ?? t("notifications.eventFallback"),
          type:
            meta.ticketType === "sell"
              ? t("notifications.ticketSell")
              : t("notifications.ticketBuy"),
        }),
      };
    default:
      return { title: item.title, body: item.body };
  }
}

const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading, refetch } = useNotificationsQuery();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const handleMarkAll = useCallback(async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsAsRead(queryClient);
    await refetch();
  }, [queryClient, refetch, unreadCount]);

  const handleItemClick = useCallback(
    async (item: AppNotification) => {
      if (!item.read) {
        await markNotificationAsRead(item.id, queryClient);
      }
    },
    [queryClient],
  );

  return (
    <div data-cmp="Notifications" className="s-notifications">
      <PageNavigation title={t("notifications.title")} fallback={ROUTES.HOME} />

      <main className="s-notifications__main">
        {unreadCount > 0 && (
          <div className="s-notifications__toolbar">
            <button
              type="button"
              className="s-notifications__mark-all"
              onClick={() => void handleMarkAll()}
            >
              {t("notifications.markAllRead")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="s-notifications__loading">{t("common.loading")}</div>
        ) : notifications.length === 0 ? (
          <div className="s-notifications__empty">
            <BellIcon size={40} className="s-notifications__empty-icon" />
            <div className="s-notifications__empty-title">{t("notifications.emptyTitle")}</div>
            <div className="s-notifications__empty-desc">{t("notifications.emptyDesc")}</div>
          </div>
        ) : (
          <div className="s-notifications__list">
            {notifications.map((item) => {
              const Icon = notificationIcon();
              const text = resolveNotificationText(item, t);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`s-notifications__item${item.read ? "" : " s-notifications__item--unread"}`}
                  onClick={() => void handleItemClick(item)}
                >
                  <div className={notificationIconClass()}>
                    <Icon size={20} />
                  </div>
                  <div className="s-notifications__content">
                    <div className="s-notifications__title-row">
                      <span className="s-notifications__title">{text.title}</span>
                      <span className="s-notifications__time">
                        {formatTimeAgo(item.createdAt, i18n.language)}
                      </span>
                    </div>
                    <div className="s-notifications__body">{text.body}</div>
                  </div>
                  {!item.read && <span className="s-notifications__dot" aria-hidden />}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
