import React from 'react';
import { PageTabBarChrome } from '../../../../components/navigation/BottomNav';
import PageNavigation from '../../../../components/navigation/PageNavigation';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';
import { ROUTES } from '../../../../utils/route';
import { useT } from '../../../../hooks/useI18n';

export type EventDetailFallbackVariant = 'invalidId' | 'loadError' | 'missing';

export type EventDetailFallbackProps = {
  variant: EventDetailFallbackVariant;
  onRetry?: () => void;
};

const EventDetailFallback: React.FC<EventDetailFallbackProps> = ({
  variant,
  onRetry,
}) => {
  const t = useT();
  return (
    <View className="s-event-detail s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-event-detail__shell">
        <PageNavigation title={t('eventDetail.detailTitle')} fallback={ROUTES.EVENTS} />
        <View className="s-event-detail__fallback">
          {variant === 'loadError' ? (
            <>
              <Text>{t('eventDetail.loadFailed')}</Text>
              <Button className="s-event-detail__retry" onClick={onRetry}>
                <Text className="s-btn-label">{t('eventDetail.retry')}</Text>
              </Button>
            </>
          ) : (
            t('eventDetail.notFound')
          )}
        </View>
      </View>
      <PageTabBarChrome />
    </View>
  );
};

export default EventDetailFallback;
