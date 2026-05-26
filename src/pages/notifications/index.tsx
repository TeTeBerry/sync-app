import "./notifications.scss";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  BellIcon,
  HeartIcon,
  MessageCircleIcon,
  SparklesIcon,
  MegaphoneIcon,
  Trash2Icon,
} from "lucide-react";
import PageNavigation from "../../components/PageNavigation";
import {
  clearAllNotificationsAndInvalidate,
  deleteNotificationAndInvalidate,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotificationsQuery,
} from "../../hooks/useSyncApi";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import type { AppNotification } from "../../types/backend";
import {
  formatNotificationTimeAgo,
  getNotificationCategory,
  resolveNotificationText,
  type NotificationCategory,
} from "../../utils/notificationDisplay";
import { navigateFromNotification, ROUTES } from "../../utils/route";

type CategoryFilter = "all" | NotificationCategory;

const CATEGORY_TABS: CategoryFilter[] = ["all", "comment", "like", "system", "match"];

function NotificationIcon({
  category,
}: {
  category: NotificationCategory;
}) {
  const iconProps = { size: 20 as const };

  switch (category) {
    case "like":
      return <HeartIcon {...iconProps} />;
    case "comment":
      return <MessageCircleIcon {...iconProps} />;
    case "match":
      return <SparklesIcon {...iconProps} />;
    case "system":
      return <MegaphoneIcon {...iconProps} />;
    default:
      return <BellIcon {...iconProps} />;
  }
}

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading, refetch } = useNotificationsQuery();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t("common.cancel"),
  });

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return notifications;
    return notifications.filter(
      (item) => getNotificationCategory(item.meta) === activeCategory,
    );
  }, [activeCategory, notifications]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: notifications.length,
      comment: 0,
      like: 0,
      system: 0,
      match: 0,
      general: 0,
    };
    for (const item of notifications) {
      const category = getNotificationCategory(item.meta);
      counts[category] += 1;
    }
    return counts;
  }, [notifications]);

  const handleMarkAll = useCallback(async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsAsRead(queryClient);
    await refetch();
  }, [queryClient, refetch, unreadCount]);

  const handleClearAll = useCallback(async () => {
    if (notifications.length === 0) return;
    const confirmed = await confirm({
      title: t("notifications.clearAllConfirmTitle"),
      message: t("notifications.clearAllConfirmMessage"),
      confirmText: t("notifications.clearAll"),
      danger: true,
    });
    if (!confirmed) return;
    await clearAllNotificationsAndInvalidate(queryClient);
    await refetch();
  }, [confirm, notifications.length, queryClient, refetch, t]);

  const handleDelete = useCallback(
    async (event: React.MouseEvent, item: AppNotification) => {
      event.stopPropagation();
      const confirmed = await confirm({
        title: t("notifications.deleteConfirmTitle"),
        message: t("notifications.deleteConfirmMessage"),
        confirmText: t("notifications.delete"),
        danger: true,
      });
      if (!confirmed) return;
      await deleteNotificationAndInvalidate(queryClient, item.id);
      await refetch();
    },
    [confirm, queryClient, refetch, t],
  );

  const handleItemClick = useCallback(
    async (item: AppNotification) => {
      if (!item.read) {
        await markNotificationAsRead(item.id, queryClient);
      }
      navigateFromNotification(item.meta);
    },
    [queryClient],
  );

  return (
    <div data-cmp="Notifications" className="s-notifications">
      <PageNavigation title={t("notifications.title")} fallback={ROUTES.HOME} />

      <main className="s-notifications__main">
        <div className="s-notifications__tabs" role="tablist">
          {CATEGORY_TABS.map((category) => {
            const count = categoryCounts[category];
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`s-notifications__tab${isActive ? " s-notifications__tab--active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {t(`notifications.categories.${category}`)}
                {count > 0 && (
                  <span className="s-notifications__tab-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {notifications.length > 0 && (
          <div className="s-notifications__toolbar">
            {unreadCount > 0 && (
              <button
                type="button"
                className="s-notifications__toolbar-btn"
                onClick={() => void handleMarkAll()}
              >
                {t("notifications.markAllRead")}
              </button>
            )}
            <button
              type="button"
              className="s-notifications__toolbar-btn s-notifications__toolbar-btn--danger"
              onClick={() => void handleClearAll()}
            >
              {t("notifications.clearAll")}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="s-notifications__loading">{t("common.loading")}</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="s-notifications__empty">
            <BellIcon size={40} className="s-notifications__empty-icon" />
            <div className="s-notifications__empty-title">{t("notifications.emptyTitle")}</div>
            <div className="s-notifications__empty-desc">{t("notifications.emptyDesc")}</div>
          </div>
        ) : (
          <div className="s-notifications__list">
            {filteredNotifications.map((item) => {
              const display = resolveNotificationText(item, t);
              return (
                <div
                  key={item.id}
                  className={`s-notifications__item${item.read ? "" : " s-notifications__item--unread"}`}
                >
                  <button
                    type="button"
                    className="s-notifications__item-main"
                    onClick={() => void handleItemClick(item)}
                  >
                    <div
                      className={`s-notifications__icon s-notifications__icon--${display.category}`}
                    >
                      <NotificationIcon category={display.category} />
                    </div>
                    <div className="s-notifications__content">
                      <div className="s-notifications__title-row">
                        <span className="s-notifications__title">{display.title}</span>
                        <span className="s-notifications__time">
                          {formatNotificationTimeAgo(item.createdAt, t)}
                        </span>
                      </div>
                      <div className="s-notifications__body">{display.body}</div>
                    </div>
                    {!item.read && <span className="s-notifications__dot" aria-hidden />}
                  </button>
                  <button
                    type="button"
                    className="s-notifications__delete"
                    aria-label={t("notifications.delete")}
                    onClick={(event) => void handleDelete(event, item)}
                  >
                    <Trash2Icon size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {confirmDialog}
    </div>
  );
};

export default NotificationsPage;
