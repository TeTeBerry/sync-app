import './HomeMyNextEvent.scss';
import type { FC } from 'react';
import { CalendarDays, ChevronRight } from '../../../components/icons';
import { Button } from '../../../components/ui';
import type { HomeSummary } from '../../../types/backend';
import { Text, View } from '@tarojs/components';

type HomeMyNextEventProps = {
  event: HomeSummary['signupEvents'][number];
  onViewDetail: () => void;
  onOpenPosts: () => void;
};

export const HomeMyNextEvent: FC<HomeMyNextEventProps> = ({
  event,
  onViewDetail,
  onOpenPosts,
}) => {
  const venue = event.location?.trim() ?? '';

  return (
    <View className="s-home-next" aria-label="我的下一场活动">
      <View className="s-home-next__head">
        <View className="s-home-next__kicker" aria-hidden>
          <CalendarDays size={14} color="#4cc9f0" />
          <Text className="s-home-next__kicker-text">我的下一场</Text>
        </View>
        <View
          className="s-home-next__detail-link"
          onClick={onViewDetail}
          role="button"
          aria-label={`查看${event.title}`}
        >
          <Text className="s-home-next__detail-link-text">详情</Text>
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

      <View className="s-home-next__actions">
        <Button
          className="s-home-next__btn s-home-next__btn--primary"
          onClick={onOpenPosts}
        >
          <Text className="s-home-next__btn-text">发帖</Text>
        </Button>
        <Button
          className="s-home-next__btn s-home-next__btn--ghost"
          onClick={onViewDetail}
        >
          <Text className="s-home-next__btn-text s-home-next__btn-text--ghost">
            查看活动
          </Text>
        </Button>
      </View>
    </View>
  );
};
