import './HomeMyNextEvent.scss';
import type { FC } from 'react';
import { CalendarDays, ChevronRight, MessageCircle } from '../../../components/icons';
import { Button } from '../../../components/ui';
import type { HomeSummary } from '../../../types/backend';
import type { FestivalPlanChecklist, FestivalPlanTask } from '@/domains/festival-plan';
import { useT } from '@/hooks/useI18n';
import { formatActivityLocationLabel } from '@/utils/formatActivityDisplay';
import { Text, View } from '@tarojs/components';

type HomeMyNextEventProps = {
  event: HomeSummary['signupEvents'][number];
  postEngagement?: HomeSummary['myNextEventPostEngagement'];
  festivalPlan?: FestivalPlanChecklist | null;
  onViewDetail: () => void;
  onOpenPosts: () => void;
  onOpenPostReplies?: () => void;
  onFestivalPlanPress?: () => void;
  onNextTaskPress?: (task: FestivalPlanTask) => void;
};

function formatReplyHint(
  count: number,
  t: (key: string, params?: Record<string, string | number>) => string,
): string {
  return count > 99 ? t('home.newRepliesMax') : t('home.newReplies', { count: count });
}

export const HomeMyNextEvent: FC<HomeMyNextEventProps> = ({
  event,
  postEngagement,
  festivalPlan,
  onViewDetail,
  onOpenPosts,
  onOpenPostReplies,
  onFestivalPlanPress,
  onNextTaskPress,
}) => {
  const t = useT();
  const venue = formatActivityLocationLabel(event.location);
  const unreadReplyCount = postEngagement?.unreadReplyCount ?? 0;
  const showReplyHint = unreadReplyCount > 0 && Boolean(onOpenPostReplies);
  const nextTask =
    festivalPlan?.nextTaskKey != null
      ? festivalPlan.tasks.find((task) => task.key === festivalPlan.nextTaskKey)
      : undefined;
  const showFestivalPlanProgress = festivalPlan != null && festivalPlan.totalCount > 0;
  const progressPercent =
    festivalPlan != null && festivalPlan.totalCount > 0
      ? Math.round((festivalPlan.completedCount / festivalPlan.totalCount) * 100)
      : 0;

  const handleProgressPress = () => {
    if (nextTask && onNextTaskPress) {
      onNextTaskPress(nextTask);
      return;
    }
    if (onFestivalPlanPress) {
      onFestivalPlanPress();
      return;
    }
    onViewDetail();
  };

  return (
    <View className="s-home-next" aria-label={t('home.myNextEvent')}>
      <View className="s-home-next__head">
        <View className="s-home-next__kicker" aria-hidden>
          <CalendarDays size={14} color="#4cc9f0" />
          <Text className="s-home-next__kicker-text">{t('home.myNextEvent')}</Text>
        </View>
        <View
          className="s-home-next__detail-link"
          onClick={onViewDetail}
          role="button"
          aria-label={`${t('home.detail')} ${event.title}`}
        >
          <Text className="s-home-next__detail-link-text">{t('home.detail')}</Text>
          <ChevronRight size={14} color="#4cc9f0" />
        </View>
      </View>

      <View className="s-home-next__body" onClick={onViewDetail} role="button">
        <Text className="s-home-next__title">{event.title}</Text>
        <Text className="s-home-next__meta">
          {event.date}
          {venue ? ` · ${venue}` : ''}
        </Text>
      </View>

      {showFestivalPlanProgress ? (
        <View
          className="s-home-next__plan-progress"
          onClick={handleProgressPress}
          role="button"
          aria-label={t('home.progressAria', {
            completed: festivalPlan.completedCount,
            total: festivalPlan.totalCount,
          })}
        >
          <View className="s-home-next__plan-progress-head">
            <Text className="s-home-next__plan-progress-label">
              {t('home.progress', {
                completed: festivalPlan.completedCount,
                total: festivalPlan.totalCount,
              })}
            </Text>
            {nextTask ? (
              <Text className="s-home-next__plan-progress-next">
                {nextTask.trailingLabel}
              </Text>
            ) : null}
          </View>
          <View className="s-home-next__plan-progress-bar" aria-hidden>
            <View
              className="s-home-next__plan-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </View>
        </View>
      ) : null}

      {showReplyHint ? (
        <View
          className="s-home-next__reply-hint"
          onClick={onOpenPostReplies}
          role="button"
          aria-label={formatReplyHint(unreadReplyCount, t)}
        >
          <MessageCircle size={14} color="#ff0066" />
          <Text className="s-home-next__reply-hint-text">
            {formatReplyHint(unreadReplyCount, t)}
          </Text>
          <ChevronRight size={14} color="#ff0066" />
        </View>
      ) : null}

      <View className="s-home-next__actions">
        <Button
          className="s-home-next__btn s-home-next__btn--primary"
          onClick={onOpenPosts}
        >
          <Text className="s-home-next__btn-text">{t('home.post')}</Text>
        </Button>
        <Button
          className="s-home-next__btn s-home-next__btn--ghost"
          onClick={onViewDetail}
        >
          <Text className="s-home-next__btn-text s-home-next__btn-text--ghost">
            {t('home.viewEvent')}
          </Text>
        </Button>
      </View>
    </View>
  );
};
