import './notifications.scss';
import { useDidShow } from '@tarojs/taro';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { Bell, Megaphone, Trash2 } from '../../../components/icons';
import PageNavigation from '../../../components/navigation/PageNavigation';
import {
  clearAllNotificationsAndInvalidate,
  deleteNotificationAndInvalidate,
  invalidateNotificationQueries,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotificationsQuery,
} from '../../../hooks/useSyncApi';
import { notificationListQueryKey } from '../../../cache/notificationCache';
import { resolveRequestUserId } from '../../../api/requestContext';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import type { AppNotification } from '../../../types/backend';
import {
  formatNotificationTimeAgo,
  getNotificationCategory,
  resolveNotificationText,
  type NotificationCategory,
} from '../../../utils/notificationDisplay';
import { navigateFromNotification, ROUTES } from '../../../utils/route';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';
import { useStaleBackgroundRefetch } from '../../../hooks/useStaleBackgroundRefetch';
import { useWindowedList } from '../../../hooks/useWindowedList';
import {
  PROFILE_LIST_INITIAL_RENDER,
  PROFILE_LIST_MAX_VISIBLE,
  PROFILE_LIST_RENDER_STEP,
} from '../../../constants/listPerf';
import { useT } from '@/hooks/useI18n';

type CategoryFilter = 'all' | 'system';

const CATEGORY_TABS: CategoryFilter[] = ['all', 'system'];

function NotificationIcon({ category }: { category: NotificationCategory }) {
  if (category === 'system') {
    return <Megaphone size={20} />;
  }
  return <Bell size={20} />;
}

const NotificationsPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const t = useT();
  const notificationsQuery = useNotificationsQuery();
  const isLoading = notificationsQuery.isLoading;
  const refetch = notificationsQuery.refetch;

  useStaleBackgroundRefetch({
    refetch,
    queryKey: [...notificationListQueryKey(resolveRequestUserId())],
    staleTime: 30_000,
  });

  useDidShow(() => {
    void invalidateNotificationQueries();
  });

  const contentReady = !isLoading;
  usePageRouteReady(contentReady);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });

  const unreadCount = useMemo(
    () => (notificationsQuery.data ?? []).filter((item) => !item.read).length,
    [notificationsQuery.data],
  );

  const filteredNotifications = useMemo(() => {
    const notifications = notificationsQuery.data ?? [];
    if (activeCategory === 'all') return notifications;
    return notifications.filter(
      (item) => getNotificationCategory(item.meta) === activeCategory,
    );
  }, [activeCategory, notificationsQuery.data]);

  const {
    visibleItems: visibleNotifications,
    showMore: showMoreNotifications,
    hasMoreToShow: hasMoreNotifications,
    hiddenCount: hiddenNotificationCount,
    resetWindow: resetNotificationWindow,
  } = useWindowedList(filteredNotifications, {
    initialSize: PROFILE_LIST_INITIAL_RENDER,
    step: PROFILE_LIST_RENDER_STEP,
    maxVisible: PROFILE_LIST_MAX_VISIBLE,
  });

  useEffect(() => {
    resetNotificationWindow();
  }, [activeCategory, resetNotificationWindow]);

  const unreadTabCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: 0,
      system: 0,
    };
    for (const item of notificationsQuery.data ?? []) {
      if (item.read) continue;
      counts.all += 1;
      if (getNotificationCategory(item.meta) === 'system') {
        counts.system += 1;
      }
    }
    return counts;
  }, [notificationsQuery.data]);

  const handleMarkAll = useCallback(async () => {
    if (unreadCount === 0) return;
    await markAllNotificationsAsRead();
    await refetch();
  }, [refetch, unreadCount]);

  const handleClearAll = useCallback(async () => {
    if ((notificationsQuery.data ?? []).length === 0) return;
    const confirmed = await confirm({
      title: t('notifications.clearAllTitle'),
      message: t('notifications.clearAllMessage'),
      confirmText: t('notifications.confirmText'),
    });
    if (!confirmed) return;
    await clearAllNotificationsAndInvalidate();
    await refetch();
  }, [confirm, notificationsQuery.data, refetch, t]);

  const handleDelete = useCallback(
    async (event: { stopPropagation: () => void }, item: AppNotification) => {
      event.stopPropagation();
      const confirmed = await confirm({
        title: t('notifications.deleteTitle'),
        message: t('notifications.deleteMessage'),
        confirmText: t('notifications.deleteConfirmText'),
      });
      if (!confirmed) return;
      await deleteNotificationAndInvalidate(item.id);
      await refetch();
    },
    [confirm, refetch, t],
  );

  const handleItemClick = useCallback(async (item: AppNotification) => {
    await navigateFromNotification(item.meta);
    if (!item.read) {
      void markNotificationAsRead(item.id);
    }
  }, []);

  return (
    <View data-cmp="Notifications" className="s-notifications">
      <PageNavigation
        title={t('notifications.title')}
        fallback={ROUTES.HOME}
        tone="surface"
      />

      <View className="s-notifications__main">
        <View className="s-notifications__tabs" role="tablist">
          {CATEGORY_TABS.map((category) => {
            const count = unreadTabCounts[category];
            const isActive = activeCategory === category;
            return (
              <Button
                key={category}
                role="tab"
                aria-selected={isActive}
                className={`s-notifications__tab${isActive ? ' s-notifications__tab--active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                <Text className="s-btn-label">
                  {category === 'all'
                    ? t('notifications.categoryAll')
                    : t('notifications.categorySystem')}
                </Text>
                {count > 0 && (
                  <Text className="s-notifications__tab-count">{count}</Text>
                )}
              </Button>
            );
          })}
        </View>

        {notifications.length > 0 && (
          <View className="s-notifications__toolbar">
            {unreadCount > 0 && (
              <Button
                className="s-notifications__toolbar-btn"
                onClick={() => void handleMarkAll()}
              >
                <Text className="s-btn-label">{t('notifications.markAllRead')}</Text>
              </Button>
            )}
            <Button
              className="s-notifications__toolbar-btn"
              onClick={() => void handleClearAll()}
            >
              <Text className="s-btn-label">{t('notifications.clearAll')}</Text>
            </Button>
          </View>
        )}

        {isLoading && notifications.length === 0 ? (
          <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
        ) : filteredNotifications.length === 0 ? (
          <View className="s-notifications__empty">
            <Bell size={40} className="s-notifications__empty-icon" />
            <View className="s-notifications__empty-title">
              {t('notifications.emptyTitle')}
            </View>
            <View className="s-notifications__empty-desc">
              {t('notifications.emptyDesc')}
            </View>
          </View>
        ) : (
          <View className="s-notifications__list">
            {visibleNotifications.map((item) => {
              const display = resolveNotificationText(item);
              return (
                <View
                  key={item.id}
                  className={`s-notifications__item${item.read ? '' : ' s-notifications__item--unread'}`}
                >
                  <Button
                    className="s-notifications__item-main"
                    onClick={() => void handleItemClick(item)}
                  >
                    <View
                      className={`s-notifications__icon s-notifications__icon--${display.category}`}
                    >
                      <NotificationIcon category={display.category} />
                    </View>
                    <View className="s-notifications__content">
                      <View className="s-notifications__title-row">
                        <Text className="s-notifications__title">{display.title}</Text>
                        <Text className="s-notifications__time">
                          {formatNotificationTimeAgo(item.createdAt)}
                        </Text>
                      </View>
                      <View className="s-notifications__body">{display.body}</View>
                    </View>
                    {!item.read && (
                      <Text className="s-notifications__dot" aria-hidden />
                    )}
                  </Button>
                  <Button
                    className="s-notifications__delete"
                    aria-label="删除"
                    onClick={(event) => void handleDelete(event, item)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </View>
              );
            })}
            {hasMoreNotifications ? (
              <Button
                className="s-notifications__show-more"
                onClick={showMoreNotifications}
              >
                <Text className="s-btn-label">
                  {t('notifications.showMore', { count: hiddenNotificationCount })}
                </Text>
              </Button>
            ) : null}
          </View>
        )}
      </View>

      {confirmDialog}
    </View>
  );
};

export default NotificationsPage;
