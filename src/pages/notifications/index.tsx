import "./notifications.scss";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import {
  BellIcon,
  HeartIcon,
  MessageCircleIcon,
  SparklesIcon,
  MegaphoneIcon,
} from "lucide-react";
import PageNavigation from "../../components/PageNavigation";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotificationsQuery,
} from "../../hooks/useSyncApi";
import type { AppNotification } from "../../types/backend";
import {
  formatNotificationTimeAgo,
  resolveNotificationText,
  type NotificationCategory,
} from "../../utils/notificationDisplay";
import { navigateFromNotification, ROUTES } from "../../utils/route";

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
      if (!navigateFromNotification(item.meta)) {
        return;
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
              const display = resolveNotificationText(item, t);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`s-notifications__item${item.read ? "" : " s-notifications__item--unread"}`}
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
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
