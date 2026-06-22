import './EventCard.scss';
import React, { memo, useCallback, useMemo } from 'react';
import { ImageWithFallback } from '../ImageWithFallback';
import { Button } from '../ui';
import { Bell, Ticket, Users } from '../../components/icons';
import { useActivityUpdateSubscribeAction } from '@/domains/activity-info/hooks/useActivityUpdateSubscribeAction';
import type { ActivityMapRegion } from '../../constants/activityMapRegion';
import { formatActivityAreaLabel } from '../../utils/filterActivitiesForEventsCatalog';
import { getGenerateTravelGuideCta } from '../../constants/aiCtaLabels';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../utils/activityStatus';
import { Text, View } from '@tarojs/components';
import { formatEventHeroMetaLine } from '../../utils/eventCardDisplay';
import { PLACEHOLDER_EVENT_HERO } from '../../constants/remoteImages';
import { thumbnailImageUrl } from '../../utils/imageUrl';
import { IMAGE_SIZE } from '../../constants/imageSizes';
import { resolveEventCardLegacyId } from '../../utils/apiMappers';
import { useRouteTransitionActive } from '../../utils/route';
import { useT } from '@/hooks/useI18n';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { requestUnfollowActivityConfirm } from '@/utils/unfollowActivityConfirm';

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  going?: boolean;
  variant?: 'default' | 'list';
  category?: string;
  region?: ActivityMapRegion;
  area?: string;
  lineupPublished?: boolean;
  recruitPostCount?: number;
  onTeamUp?: () => void;
  onTeamUpWarmup?: () => void;
}

const EventCardInner: React.FC<EventCardProps> = ({
  id = '1',
  title = 'Audien',
  date = 'Sat 12/20 at 10:00 PM',
  location = 'The Ave Live',
  image = PLACEHOLDER_EVENT_HERO,
  going = false,
  variant = 'list',
  category = '',
  region,
  area,
  lineupPublished,
  recruitPostCount = 0,
  onTeamUp,
  onTeamUpWarmup,
}) => {
  const t = useT();
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });
  const travelGuideCta = getGenerateTravelGuideCta();
  const activityTitle = useMemo(() => {
    const trimmed = title?.trim();
    return trimmed || t('eventCard.activityFallback');
  }, [title, t]);
  const displayCategory = category || t('eventCard.category');
  const regionLabel = formatActivityAreaLabel({ area, region });
  const lineupBadge =
    lineupPublished === true
      ? t('eventCard.lineupPublished')
      : lineupPublished === false
        ? t('eventCard.lineupPending')
        : null;
  const legacyId = resolveEventCardLegacyId(id);
  const confirmUnfollow = useCallback(
    () => requestUnfollowActivityConfirm(confirm, title),
    [confirm, title],
  );
  const {
    subscribed: followed,
    submitting,
    handleSubscribe,
  } = useActivityUpdateSubscribeAction(legacyId ?? undefined, going, {
    toggleable: true,
    confirmUnfollow,
  });
  const isNavigating = useRouteTransitionActive(legacyId ?? undefined);
  const thumbSrc = thumbnailImageUrl(
    image,
    variant === 'list' ? IMAGE_SIZE.eventCardList : IMAGE_SIZE.eventCardDefault,
  );
  const status = getActivityStatusFromActivity(date, title);
  const heroSubtitle = useMemo(
    () => formatEventHeroMetaLine(date, location),
    [date, location],
  );
  const recruitPostsLabel =
    recruitPostCount > 0
      ? t('common.teamPosts', { count: recruitPostCount })
      : t('common.teamPostsEmpty');

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
    <>
      <View
        data-cmp="EventCard"
        className={[
          's-event-card',
          's-event-card--list',
          activityStatusCardClass(status),
        ]
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

          <View
            className={[
              's-event-card__follow-tag',
              followed && 's-event-card__follow-tag--followed',
              submitting && 's-event-card__follow-tag--loading',
            ]
              .filter(Boolean)
              .join(' ')}
            role="button"
            aria-label={
              followed
                ? t('eventCard.unfollow', { title: activityTitle })
                : t('eventCard.follow', { title: activityTitle })
            }
            onTouchStart={(event) => {
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.stopPropagation();
              handleSubscribe();
            }}
          >
            {!followed ? <Bell size={12} aria-hidden /> : null}
            <Text className="s-event-card__follow-tag-text">
              {submitting
                ? followed
                  ? t('eventCard.unfollowing')
                  : t('eventCard.following')
                : followed
                  ? t('eventCard.followed', { title: activityTitle })
                  : t('eventCard.follow', { title: activityTitle })}
            </Text>
          </View>

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
              <Text className="s-event-card__joined-text">{recruitPostsLabel}</Text>
            </View>
            <View className="s-event-card__detail-tags">
              {regionLabel ? (
                <Text className="s-event-card__detail-tag s-event-card__detail-tag--region">
                  {regionLabel}
                </Text>
              ) : null}
              {lineupBadge ? (
                <Text
                  className={[
                    's-event-card__detail-tag',
                    lineupPublished
                      ? 's-event-card__detail-tag--lineup-published'
                      : 's-event-card__detail-tag--lineup-pending',
                  ].join(' ')}
                >
                  {lineupBadge}
                </Text>
              ) : null}
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
                {isNavigating ? t('eventCard.opening') : t('eventCard.openDetail')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
      {confirmDialog}
    </>
  );
};

const EventCard = memo(EventCardInner);
export default EventCard;
