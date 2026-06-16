import './EventCard.scss';
import React, { memo, useMemo } from 'react';
import AvatarGroup from '../AvatarGroup';
import { ImageWithFallback } from '../ImageWithFallback';
import { Button } from '../ui';
import {
  Calendar,
  Flame,
  MapPin,
  Sparkles,
  Ticket,
  Users,
} from '../../components/icons';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../utils/activityStatus';
import { Text, View } from '@tarojs/components';
import {
  formatEventDateBadge,
  formatEventFullDate,
  formatEventHeroMetaLine,
  formatEventHeroSubtitle,
} from '../../utils/eventCardDisplay';
import { PLACEHOLDER_EVENT_HERO } from '../../constants/remoteImages';
import { thumbnailImageUrl } from '../../utils/imageUrl';
import { resolveEventCardLegacyId } from '../../utils/apiMappers';
import { useRouteTransitionActive } from '../../utils/route';

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  attendees?: number;
  hot?: boolean;
  going?: boolean;
  variant?: 'default' | 'list';
  category?: string;
  ctaVariant?: 'join' | 'detail';
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
  going = false,
  variant = 'list',
  category = '电音节',
  ctaVariant = 'join',
  onTeamUp,
  onTeamUpWarmup,
}) => {
  const legacyId = resolveEventCardLegacyId(id);
  const isNavigating = useRouteTransitionActive(legacyId ?? undefined);
  const thumbSrc = thumbnailImageUrl(image, variant === 'list' ? 200 : 320);
  const status = getActivityStatusFromActivity(date, title);
  const dateBadge = useMemo(() => formatEventDateBadge(date), [date]);
  const fullDate = useMemo(() => formatEventFullDate(date, title), [date, title]);
  const heroSubtitle = useMemo(
    () =>
      ctaVariant === 'detail'
        ? formatEventHeroMetaLine(date, location)
        : formatEventHeroSubtitle(title, location),
    [ctaVariant, date, location, title],
  );

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

        {ctaVariant !== 'detail' ? (
          <View className="s-event-card__date-badge" aria-hidden>
            <Text className="s-event-card__date-primary">{dateBadge.primary}</Text>
            {dateBadge.secondary ? (
              <Text className="s-event-card__date-secondary">
                {dateBadge.secondary}
              </Text>
            ) : null}
          </View>
        ) : null}

        {hot ? (
          <Text className="s-event-card__hot-tag">
            <Flame size={12} aria-hidden />
            热门
          </Text>
        ) : null}

        <View className="s-event-card__hero-copy">
          <Text className="s-event-card__hero-title">{title}</Text>
          {heroSubtitle ? (
            <Text className="s-event-card__hero-subtitle">{heroSubtitle}</Text>
          ) : null}
        </View>
      </View>

      {ctaVariant !== 'detail' ? (
        <View className="s-event-card__info-row">
          <View className="s-event-card__info-item">
            <MapPin size={14} className="s-event-card__info-icon" aria-hidden />
            <Text className="s-event-card__info-text">{location}</Text>
          </View>
          {fullDate ? (
            <View className="s-event-card__info-item s-event-card__info-item--date">
              <Calendar size={14} className="s-event-card__info-icon" aria-hidden />
              <Text className="s-event-card__info-text">{fullDate}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        className={[
          's-event-card__footer',
          ctaVariant === 'detail' ? 's-event-card__footer--detail' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {ctaVariant === 'detail' ? (
          <View className="s-event-card__detail-meta">
            <View className="s-event-card__joined">
              <Users size={14} aria-hidden />
              <Text className="s-event-card__joined-text">{`${attendees}+ 人已加入`}</Text>
            </View>
            <View className="s-event-card__detail-tags">
              <Text className="s-event-card__detail-tag">{category}</Text>
              <Text className="s-event-card__detail-tag s-event-card__detail-tag--ai">
                ✨ AI出行攻略
              </Text>
            </View>
          </View>
        ) : (
          <View className="s-event-card__social">
            <AvatarGroup total={attendees} />
          </View>
        )}

        <View className="s-event-card__cta">
          <Button
            className={[
              's-event-card__team-btn',
              ctaVariant === 'detail' ? 's-event-card__team-btn--detail' : '',
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
            {ctaVariant === 'detail' ? (
              <Ticket size={15} aria-hidden />
            ) : (
              <Sparkles size={15} aria-hidden />
            )}
            <Text className="s-event-card__team-btn-text">
              {ctaVariant === 'detail'
                ? '进入详情'
                : isNavigating
                  ? '加入中…'
                  : going
                    ? '已加入'
                    : '加入'}
            </Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

const EventCard = memo(EventCardInner);
export default EventCard;
