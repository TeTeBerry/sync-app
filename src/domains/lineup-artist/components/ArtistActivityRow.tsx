import './ArtistActivityRow.scss';
import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { ChevronRight } from '../../../components/icons';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { useT } from '@/hooks/useI18n';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { PLACEHOLDER_EVENT_HERO } from '../../../constants/remoteImages';
import type { BackendActivity } from '../../../types/backend';
import { formatActivityAreaLabel } from '../../../utils/filterActivitiesForEventsCatalog';
import { thumbnailImageUrl } from '../../../utils/imageUrl';

export type ArtistActivityRowProps = {
  activity: BackendActivity;
  highlight?: boolean;
  onPress: () => void;
};

function buildActivityMetaLine(
  activity: BackendActivity,
  areaLabel: string | null,
): string | null {
  if (areaLabel) {
    return areaLabel;
  }
  const date = activity.date?.trim();
  return date || null;
}

export const ArtistActivityRow: FC<ArtistActivityRowProps> = ({
  activity,
  highlight = false,
  onPress,
}) => {
  const t = useT();
  const areaLabel = formatActivityAreaLabel(activity);
  const metaLine = buildActivityMetaLine(activity, areaLabel);
  const lineupLabel =
    activity.lineupPublished === true
      ? t('eventCard.lineupPublished')
      : activity.lineupPublished === false
        ? t('eventCard.lineupPending')
        : null;
  const thumbSrc = thumbnailImageUrl(
    activity.image ?? PLACEHOLDER_EVENT_HERO,
    IMAGE_SIZE.eventCardList,
  );

  return (
    <View
      className={[
        's-artist-activity-row',
        highlight ? 's-artist-activity-row--highlight' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      hoverClass="s-artist-activity-row--pressed"
      onClick={onPress}
    >
      <View className="s-artist-activity-row__thumb-wrap">
        <ImageWithFallback
          src={thumbSrc}
          alt={activity.name}
          wrapperClassName="s-artist-activity-row__thumb"
          imageClassName="s-artist-activity-row__thumb-img"
          fallbackWrapperClassName="s-artist-activity-row__thumb s-artist-activity-row__thumb--fallback"
          fallback={activity.name.slice(0, 2)}
        />
        {activity.date?.trim() ? (
          <View className="s-artist-activity-row__thumb-date">
            <Text className="s-artist-activity-row__thumb-date-text">
              {activity.date.trim()}
            </Text>
          </View>
        ) : null}
      </View>
      <View className="s-artist-activity-row__main">
        <Text className="s-artist-activity-row__title s-line-clamp-2">
          {activity.name}
        </Text>
        {metaLine ? (
          <Text className="s-artist-activity-row__meta s-line-clamp-1">{metaLine}</Text>
        ) : null}
        {lineupLabel ? (
          <Text
            className={[
              's-artist-activity-row__badge',
              activity.lineupPublished === false
                ? 's-artist-activity-row__badge--pending'
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {lineupLabel}
          </Text>
        ) : null}
      </View>
      <View className="s-artist-activity-row__chevron" aria-hidden>
        <ChevronRight size={16} color="rgba(255,255,255,0.45)" />
      </View>
    </View>
  );
};
