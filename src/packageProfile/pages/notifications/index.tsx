import './notifications.scss';
import React, { useCallback, useMemo, useState } from 'react';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useDeferredMount } from '../../../hooks/useDeferredMount';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { Bell, Heart, MessageCircle, Megaphone, Trash2 } from 'lucide-react-taro';
import PageNavigation from '../../../components/navigation/PageNavigation';
import {
  clearAllNotificationsAndInvalidate,
  deleteNotificationAndInvalidate,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  useNotificationsQuery,
} from '../../../hooks/useSyncApi';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import type { AppNotification } from '../../../types/backend';
import {
  formatNotificationTimeAgo,
  getNotificationCategory,
  resolveNotificationText,
  type NotificationCategory,
} from '../../../utils/notificationDisplay';
import { navigateFromNotification, ROUTES } from '../../../utils/route';
import { DEFER_NOTIFICATIONS_MS } from '../../../utils/timing';
import { Button } from '../../../components/ui';
import { Text, View } from '@tarojs/components';

type CategoryFilter = 'all' | NotificationCategory;

const CATEGORY_TABS: CategoryFilter[] = ['all', 'comment', 'like', 'system'];

function NotificationIcon({ category }: { category: NotificationCategory }) {
  const iconProps = { size: 20 as const };

  switch (category) {
    case 'like':
      return <Heart {...iconProps} />;
    case 'comment':
      return <MessageCircle {...iconProps} />;
    case 'system':
      return <Megaphone {...iconProps} />;
    default:
      return <Bell {...iconProps} />;
  }
}

const NotificationsPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const listReady = useDeferredMount(DEFER_NOTIFICATIONS_MS);
  const { data: notifications = [], isLoading, refetch } = useNotificationsQuery();
  const contentReady = listReady && !isLoading;
  usePageRouteReady(contentReady);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: '取消',
  });

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'all') return notifications;
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
    await markAllNotificationsAsRead();
    await refetch();
  }, [refetch, unreadCount]);

  const handleClearAll = useCallback(async () => {
    if (notifications.length === 0) return;
    const confirmed = await confirm({
      title: '清空全部消息',
      message: '确定要删除所有消息吗？此操作不可撤销。',
      confirmText: '清空全部',
    });
    if (!confirmed) return;
    await clearAllNotificationsAndInvalidate();
    await refetch();
  }, [confirm, notifications.length, refetch]);

  const handleDelete = useCallback(
    async (event: { stopPropagation: () => void }, item: AppNotification) => {
      event.stopPropagation();
      const confirmed = await confirm({
        title: '删除消息',
        message: '确定要删除这条消息吗？',
        confirmText: '删除',
      });
      if (!confirmed) return;
      await deleteNotificationAndInvalidate(item.id);
      await refetch();
    },
    [confirm, refetch],
  );

  const handleItemClick = useCallback(async (item: AppNotification) => {
    if (!item.read) {
      await markNotificationAsRead(item.id);
    }
    navigateFromNotification(item.meta);
  }, []);

  return (
    <View data-cmp="Notifications" className="s-notifications">
      <PageNavigation title="消息通知" fallback={ROUTES.HOME} tone="surface" />

      <View className="s-notifications__main">
        <View className="s-notifications__tabs" role="tablist">
          {CATEGORY_TABS.map((category) => {
            const count = categoryCounts[category];
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
                    ? '全部'
                    : category === 'comment'
                      ? '评论'
                      : category === 'like'
                        ? '点赞'
                        : '系统'}
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
                <Text className="s-btn-label">全部已读</Text>
              </Button>
            )}
            <Button
              className="s-notifications__toolbar-btn"
              onClick={() => void handleClearAll()}
            >
              <Text className="s-btn-label">清空全部</Text>
            </Button>
          </View>
        )}

        {(isLoading && notifications.length === 0) || !listReady ? (
          <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
        ) : filteredNotifications.length === 0 ? (
          <View className="s-notifications__empty">
            <Bell size={40} className="s-notifications__empty-icon" />
            <View className="s-notifications__empty-title">暂无消息</View>
            <View className="s-notifications__empty-desc">
              评论、点赞和活动变更会在这里显示。
            </View>
          </View>
        ) : (
          <View className="s-notifications__list">
            {filteredNotifications.map((item) => {
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
          </View>
        )}
      </View>

      {confirmDialog}
    </View>
  );
};

export default NotificationsPage;
