import './EventCard.scss';
import React, { memo, useMemo } from 'react';
import { ImageWithFallback } from '../ImageWithFallback';
import { Button } from '../ui';
import { Flame, Ticket, Users } from '../../components/icons';
import { getGenerateTravelGuideCta } from '../../constants/aiCtaLabels';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../utils/activityStatus';
import { Text, View } from '@tarojs/components';
import {
  deriveEventCardStats,
  formatEventHeroMetaLine,
} from '../../utils/eventCardDisplay';
import { PLACEHOLDER_EVENT_HERO } from '../../constants/remoteImages';
import { thumbnailImageUrl } from '../../utils/imageUrl';
import { resolveEventCardLegacyId } from '../../utils/apiMappers';
import { useRouteTransitionActive } from '../../utils/route';
import { useT } from '@/hooks/useI18n';

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  attendees?: number;
  hot?: boolean;
  variant?: 'default' | 'list';
  category?: string;
  onTeamUp?: () => void;
  onTeamUpWarmup?: () => void;
}

const EventCardInner: React.FC<EventCardProps> = ({
  id = '1',
  title = 'Audien',
  date = 'Sat 12/20 at 10:00 PM',
  location = 'The Ave Live',
  image = PLACEHOLDER_EVENT_HERO,
  attendees = 0,
  hot = false,
  variant = 'list',
  category = '',
  onTeamUp,
  onTeamUpWarmup,
}) => {
  const t = useT();
  const travelGuideCta = getGenerateTravelGuideCta();
  const displayCategory = category || t('eventCard.category');
  const legacyId = resolveEventCardLegacyId(id);
  const isNavigating = useRouteTransitionActive(legacyId ?? undefined);
  const thumbSrc = thumbnailImageUrl(image, variant === 'list' ? 200 : 320);
  const status = getActivityStatusFromActivity(date, title);
  const heroSubtitle = useMemo(
    () => formatEventHeroMetaLine(date, location),
    [date, location],
  );
  const stats = useMemo(() => deriveEventCardStats(attendees), [attendees]);

  if (variant !== 'list') {
    return (
      <View
        data-cmp="EventCard"
        className={['s-event-card', activityStatusCardClass(status)]
          .filter(Boolean)
          .join(' ')}
      >
        <ImageWithFallback
          src={thumbSrc}
          alt={title}
          imageClassName="s-event-card__img"
          placeholderClassName="s-event-card__img s-event-card__img--placeholder"
          fallback={title.slice(0, 2)}
        />
        <View className="s-event-card__body">
          <Text className="s-event-card__title">{title}</Text>
          <Text className="s-event-card__date s-line-clamp-1">{date}</Text>
        </View>
      </View>
    );
  }

  return (
    <View
      data-cmp="EventCard"
      className={['s-event-card', 's-event-card--list', activityStatusCardClass(status)]
        .filter(Boolean)
        .join(' ')}
    >
      <View className="s-event-card__hero">
        <ImageWithFallback
          src={thumbSrc}
          alt={title}
          imageClassName="s-event-card__hero-img"
          placeholderClassName="s-event-card__hero-img s-event-card__hero-img--placeholder"
          fallback={title.slice(0, 2)}
        />
        <View className="s-event-card__hero-scrim" aria-hidden />

        {hot ? (
          <Text className="s-event-card__hot-tag">
            <Flame size={12} aria-hidden />
            {t('common.hot')}
          </Text>
        ) : null}

        <View className="s-event-card__hero-copy">
          <Text className="s-event-card__hero-title">{title}</Text>
          {heroSubtitle ? (
            <Text className="s-event-card__hero-subtitle">{heroSubtitle}</Text>
          ) : null}
        </View>
      </View>

      <View className="s-event-card__footer s-event-card__footer--detail">
        <View className="s-event-card__detail-meta">
          <View className="s-event-card__joined">
            <Users size={14} aria-hidden />
            <Text className="s-event-card__joined-text">
              {t('common.teamPosts', { count: stats.teamPostCount })}
            </Text>
          </View>
          <View className="s-event-card__detail-tags">
            <Text className="s-event-card__detail-tag">{displayCategory}</Text>
            <Text className="s-event-card__detail-tag s-event-card__detail-tag--ai">
              {t('eventCard.aiTag', { cta: travelGuideCta })}
            </Text>
          </View>
        </View>

        <View className="s-event-card__cta">
          <Button
            className={[
              's-event-card__team-btn',
              's-event-card__team-btn--detail',
              isNavigating ? 's-event-card__team-btn--loading' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={isNavigating}
            onTouchStart={(event) => {
              event.stopPropagation();
              onTeamUpWarmup?.();
            }}
            onClick={(event) => {
              event.stopPropagation();
              onTeamUp?.();
            }}
          >
            <Ticket size={15} aria-hidden />
            <Text className="s-event-card__team-btn-text">
              {isNavigating ? '打开中…' : '进入详情'}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

const EventCard = memo(EventCardInner);
export default EventCard;
