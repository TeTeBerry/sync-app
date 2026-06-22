import type { FC } from 'react';
import { ChevronRight } from '@/components/icons';
import { Button } from '@/components/ui';
import type { BackendActivity } from '@/types/backend';
import { formatEventHeroMetaLine } from '@/utils/eventCardDisplay';
import { formatActivityRegionLabel } from '@/utils/filterActivitiesForEventsCatalog';
import {
  getActivityStatusFromActivity,
  type ActivityStatus,
} from '@/utils/activityStatus';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { ActivityUpdateSubscribeBanner } from './ActivityUpdateSubscribeBanner';

export type EventDetailInfoSectionProps = {
  activity?: BackendActivity | null;
  activityLegacyId?: number;
  onOpenExclusiveItinerary: () => void;
};

function formatInfoUpdatedAt(value?: string): string | null {
  if (!value?.trim()) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function statusI18nKey(status: ActivityStatus): string {
  if (status === 'in_progress') {
    return 'activityInfo.status.inProgress';
  }
  if (status === 'ended') {
    return 'activityInfo.status.ended';
  }
  return 'activityInfo.status.upcoming';
}

export const EventDetailInfoSection: FC<EventDetailInfoSectionProps> = ({
  activity,
  activityLegacyId,
  onOpenExclusiveItinerary,
}) => {
  const t = useT();

  if (!activity) {
    return null;
  }

  const status = getActivityStatusFromActivity(activity.date, activity.name);
  const metaLine = formatEventHeroMetaLine(activity.date, activity.location);
  const regionLabel = formatActivityRegionLabel(activity.region);
  const updatedAt = formatInfoUpdatedAt(activity.infoUpdatedAt);
  const categoryLabel =
    activity.activityType === 'indoor'
      ? t('activityInfo.typeIndoor')
      : t('activityInfo.typeFestival');

  const summaryParts = [
    categoryLabel,
    regionLabel,
    updatedAt ? t('activityInfo.updatedAt', { date: updatedAt }) : null,
  ].filter(Boolean);

  const showSubscribeBanner = activity.lineupPublished === false;

  return (
    <View data-cmp="EventDetailInfoSection" className="s-event-detail-info">
      <View className="s-event-detail-info__card">
        <View className="s-event-detail-info__head">
          <Text
            className={[
              's-event-detail-info__status',
              `s-event-detail-info__status--${status}`,
            ].join(' ')}
          >
            {t(statusI18nKey(status))}
          </Text>
        </View>

        {metaLine ? (
          <Text className="s-event-detail-info__meta">{metaLine}</Text>
        ) : null}

        {summaryParts.length > 0 ? (
          <Text className="s-event-detail-info__summary">
            {summaryParts.join(' · ')}
          </Text>
        ) : null}

        <Button
          className="s-event-detail-info__cta"
          hoverClass="s-event-detail-info__cta--pressed"
          onClick={onOpenExclusiveItinerary}
        >
          <Text className="s-event-detail-info__cta-text">
            {t('activityInfo.viewLineupCta')}
          </Text>
          <ChevronRight size={16} color="#fff" />
        </Button>

        {showSubscribeBanner ? (
          <ActivityUpdateSubscribeBanner activityLegacyId={activityLegacyId} compact />
        ) : null}

        {activity.infoSource ? (
          <Text className="s-event-detail-info__source">
            {t('activityInfo.source', { source: activity.infoSource })}
          </Text>
        ) : null}

        <Text className="s-event-detail-info__disclaimer">
          {t('activityInfo.disclaimer')}
        </Text>
      </View>
    </View>
  );
};
