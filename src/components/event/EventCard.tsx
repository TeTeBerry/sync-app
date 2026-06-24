import './EventCard.scss';
import React, { memo, useCallback, useMemo } from 'react';
import { ImageWithFallback } from '../ImageWithFallback';
import { Button } from '../ui';
import { Bell, Check, ChevronRight, Users } from '../../components/icons';
import { useActivityUpdateSubscribeAction } from '@/domains/activity-info/hooks/useActivityUpdateSubscribeAction';
import type { ActivityMapRegion } from '../../constants/activityMapRegion';
import { formatActivityAreaLabel } from '../../utils/filterActivitiesForEventsCatalog';
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

/** Matches `--primary`; lucide icons need literal colors in mini program data URLs. */
const PRIMARY_ICON_COLOR = '#ff0066';
/** Matches `--secondary`; lucide icons need literal colors in mini program data URLs. */
const FOLLOWED_ICON_COLOR = '#4cc9f0';

interface EventCardProps {
  id?: string;
  title?: string;
  date?: string;
  location?: string;
  image?: string;
  going?: boolean;
  category?: string;
  region?: ActivityMapRegion;
  area?: string;
  lineupPublished?: boolean;
  recruitPostCount?: number;
  onCardPress?: () => void;
  onCardPressWarmup?: () => void;
  onTeamUp?: () => void;
  onTeamUpWarmup?: () => void;
  /** Page-level confirm (required when card is inside scroll-view). */
  onConfirmUnfollow?: (title: string) => Promise<boolean>;
}

const EventCardInner: React.FC<EventCardProps> = ({
  id = '1',
  title = 'Audien',
  date = 'Sat 12/20 at 10:00 PM',
  location = 'The Ave Live',
  image = PLACEHOLDER_EVENT_HERO,
  going = false,
  category = '',
  region,
  area,
  lineupPublished,
  recruitPostCount = 0,
  onCardPress,
  onCardPressWarmup,
  onTeamUp,
  onTeamUpWarmup,
  onConfirmUnfollow,
}) => {
  const t = useT();
  const internalConfirm = useConfirmDialog({
    cancelText: t('common.cancel'),
  });
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
    () =>
      onConfirmUnfollow
        ? onConfirmUnfollow(title)
        : requestUnfollowActivityConfirm(internalConfirm.confirm, title),
    [internalConfirm.confirm, onConfirmUnfollow, title],
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
  const thumbSrc = thumbnailImageUrl(image, IMAGE_SIZE.eventCardList);
  const status = getActivityStatusFromActivity(date, title);
  const heroSubtitle = useMemo(
    () => formatEventHeroMetaLine(date, location),
    [date, location],
  );
  const recruitPostsLabel =
    recruitPostCount > 0
      ? t('common.teamPosts', { count: recruitPostCount })
      : t('common.teamPostsEmpty');

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
          <View
            className="s-event-card__hero-main"
            onTouchStart={() => onCardPressWarmup?.()}
            onClick={() => onCardPress?.()}
          >
            <ImageWithFallback
              src={thumbSrc}
              alt={title}
              imageClassName="s-event-card__hero-img"
              placeholderClassName="s-event-card__hero-img s-event-card__hero-img--placeholder"
              fallback={title.slice(0, 2)}
            />
            <View className="s-event-card__hero-scrim" aria-hidden />
            <View className="s-event-card__hero-copy">
              <Text className="s-event-card__hero-title">{title}</Text>
              {heroSubtitle ? (
                <Text className="s-event-card__hero-subtitle">{heroSubtitle}</Text>
              ) : null}
            </View>
          </View>

          <Button
            className={[
              's-event-card__follow-btn',
              followed
                ? 's-event-card__follow-btn--followed'
                : lineupPublished === false
                  ? 's-event-card__follow-btn--pending-lineup'
                  : 's-event-card__follow-btn--subscribe',
              submitting && 's-event-card__follow-btn--loading',
            ]
              .filter(Boolean)
              .join(' ')}
            plain
            hoverClass="s-event-card__follow-btn--pressed"
            disabled={submitting}
            aria-label={
              followed
                ? t('eventCard.unfollow', { title: activityTitle })
                : t('eventCard.follow', { title: activityTitle })
            }
            onClick={(event) => {
              event.stopPropagation?.();
              handleSubscribe();
            }}
          >
            {followed ? (
              <Check size={15} color={FOLLOWED_ICON_COLOR} strokeWidth={2.5} />
            ) : (
              <Bell
                size={15}
                color={lineupPublished === false ? '#ffd60a' : PRIMARY_ICON_COLOR}
                strokeWidth={2.25}
              />
            )}
          </Button>
        </View>

        <View className="s-event-card__footer s-event-card__footer--detail">
          <View
            className="s-event-card__detail-meta"
            onTouchStart={() => onCardPressWarmup?.()}
            onClick={() => onCardPress?.()}
          >
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
              <Text className="s-event-card__team-btn-text">
                {isNavigating ? t('eventCard.opening') : t('eventCard.openDetail')}
              </Text>
              <ChevronRight size={14} color="#ff0066" aria-hidden />
            </Button>
          </View>
        </View>
      </View>
      {!onConfirmUnfollow ? internalConfirm.confirmDialog : null}
    </>
  );
};

const EventCard = memo(EventCardInner);
export default EventCard;
