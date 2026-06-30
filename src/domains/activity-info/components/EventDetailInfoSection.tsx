import type { FC } from 'react';
import { ChevronRight, Music2 } from '@/components/icons';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { Button } from '@/components/ui';
import type { BackendActivity } from '@/types/backend';
import { PLACEHOLDER_EVENT_HERO } from '@/constants/remoteImages';
import { formatEventHeroMetaLine } from '@/utils/eventCardDisplay';
import { activityCoverImageUrl } from '@/utils/imageUrl';
import {
  getActivityStatusFromActivity,
  activityStatusI18nKey,
} from '@/utils/activityStatus';
import { Text, View } from '@tarojs/components';
import { useMemo } from 'react';
import { useT } from '@/hooks/useI18n';
import './EventDetailInfoSection.scss';
import { ActivityUpdateSubscribeBanner } from './ActivityUpdateSubscribeBanner';
import { FestivalStoryCard } from './FestivalStoryCard';
import { useFestivalStory } from '../hooks/useFestivalStory';
import { shouldShowLineupSubscribeBanner } from '../utils/resolveLineupPublished';

export type EventDetailInfoSectionProps = {
  activity?: BackendActivity | null;
  activityLegacyId?: number;
  onOpenLineup: () => void;
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

export const EventDetailInfoSection: FC<EventDetailInfoSectionProps> = ({
  activity,
  activityLegacyId,
  onOpenLineup,
}) => {
  const t = useT();
  const festivalStory = useFestivalStory(activityLegacyId);
  const heroFallback = useMemo(() => {
    const name = activity?.name?.trim() ?? '';
    return name.slice(0, 2) || t('eventCard.activityFallback').slice(0, 2);
  }, [activity?.name, t]);

  if (!activity) {
    return null;
  }

  const status = getActivityStatusFromActivity(activity.date, activity.name);
  const metaLine = formatEventHeroMetaLine(activity.date, activity.location);
  const updatedAt = formatInfoUpdatedAt(activity.infoUpdatedAt);
  const heroSrc =
    activityCoverImageUrl(activity.image?.trim() || PLACEHOLDER_EVENT_HERO) ??
    PLACEHOLDER_EVENT_HERO;

  const showSubscribeBanner = shouldShowLineupSubscribeBanner(
    activity,
    activityLegacyId,
  );

  return (
    <View
      data-cmp="EventDetailInfoSection"
      id="event-detail-info"
      className="s-event-detail-info"
    >
      <View className="s-event-detail-info__stack">
        <View className="s-event-detail-info__hero">
          <View className="s-event-detail-info__hero-media" aria-hidden>
            <ImageWithFallback
              src={heroSrc}
              alt=""
              imageClassName="s-event-detail-info__hero-img"
              placeholderClassName="s-event-detail-info__hero-img s-event-detail-info__hero-img--placeholder"
              fallback={heroFallback}
              priority
              placeholderUntilLoaded
            />
          </View>
          <View className="s-event-detail-info__hero-scrim" aria-hidden />
          <View className="s-event-detail-info__hero-content">
            <Text className="s-event-detail-info__title">{activity.name}</Text>
            {metaLine ? (
              <Text className="s-event-detail-info__subtitle">{metaLine}</Text>
            ) : null}
          </View>
          <View className="s-event-detail-info__status-wrap">
            <View
              className={[
                's-event-detail-info__status',
                `s-event-detail-info__status--${status}`,
              ].join(' ')}
            >
              <View className="s-event-detail-info__status-icon" aria-hidden />
              <Text className="s-event-detail-info__status-text">
                {t(activityStatusI18nKey(status))}
              </Text>
            </View>
          </View>
        </View>

        <View className="s-event-detail-info__meta-group">
          <View className="s-event-detail-info__meta-card">
            <Button
              className="s-event-detail-info__nav"
              hoverClass="s-event-detail-info__nav--pressed"
              onClick={onOpenLineup}
            >
              <View className="s-event-detail-info__nav-icon" aria-hidden>
                <Music2 size={16} color="#4cc9f0" strokeWidth={2.25} />
              </View>
              <Text className="s-event-detail-info__nav-text">
                {t('activityInfo.viewLineupCta')}
              </Text>
              <ChevronRight
                className="s-event-detail-info__nav-chevron"
                size={15}
                color="#636366"
              />
            </Button>
          </View>

          {showSubscribeBanner ? (
            <ActivityUpdateSubscribeBanner
              activityLegacyId={activityLegacyId}
              activityTitle={activity.name}
              style={{ marginTop: 8 }}
            />
          ) : null}

          <FestivalStoryCard
            activityName={activity.name}
            expanded={festivalStory.expanded}
            loading={festivalStory.loading}
            story={festivalStory.story}
            disclaimer={festivalStory.disclaimer}
            error={festivalStory.error}
            onToggle={festivalStory.toggle}
            onRegenerate={festivalStory.regenerate}
          />
        </View>
      </View>

      {activity.infoSource ? (
        <Text className="s-event-detail-info__source">
          {t('activityInfo.source', { source: activity.infoSource })}
          {updatedAt ? ` · ${t('activityInfo.updatedAt', { date: updatedAt })}` : ''}
        </Text>
      ) : updatedAt ? (
        <Text className="s-event-detail-info__source">
          {t('activityInfo.updatedAt', { date: updatedAt })}
        </Text>
      ) : null}

      <Text className="s-event-detail-info__disclaimer">
        {t('activityInfo.disclaimer')}
      </Text>
    </View>
  );
};
