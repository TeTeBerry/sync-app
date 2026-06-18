import React from 'react';
import { PageTabBarChrome } from '../../../../components/navigation/BottomNav';
import PageNavigation from '../../../../components/navigation/PageNavigation';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';
import { ROUTES } from '../../../../utils/route';

export type EventDetailFallbackVariant = 'invalidId' | 'loadError' | 'missing';

export type EventDetailFallbackProps = {
  variant: EventDetailFallbackVariant;
  onRetry?: () => void;
};

const EventDetailFallback: React.FC<EventDetailFallbackProps> = ({
  variant,
  onRetry,
}) => (
  <View className="s-event-detail s-page-with-tabbar">
    <View className="s-page-with-tabbar__main s-event-detail__shell">
      <PageNavigation title="活动详情" fallback={ROUTES.EVENTS} />
      <View className="s-event-detail__fallback">
        {variant === 'loadError' ? (
          <>
            <Text>活动信息加载失败</Text>
            <Button className="s-event-detail__retry" onClick={onRetry}>
              <Text className="s-btn-label">重试</Text>
            </Button>
          </>
        ) : (
          '活动不存在'
        )}
      </View>
    </View>
    <PageTabBarChrome />
  </View>
);

export default EventDetailFallback;
