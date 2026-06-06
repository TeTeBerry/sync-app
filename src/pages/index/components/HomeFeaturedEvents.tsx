import './HomeFeaturedEvents.scss';
import { type FC } from 'react';
import { ChevronRight } from '../../../components/icons';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { Button } from '../../../components/ui';
import {
  activityStatusCardClass,
  getActivityStatusFromActivity,
} from '../../../utils/activityStatus';
import { formatActivityCategoryLabel } from '../../../utils/activityCategory';
import {
  resolveFeaturedEventLegacyId,
  type FeaturedEvent,
} from '../../../utils/apiMappers';
import { featuredPostImageUrl, thumbnailImageUrl } from '../../../utils/imageUrl';
import { useRouteTransitionActive } from '../../../utils/route';
import { goEventsListTab } from '../../../utils/route';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components';

type HomeFeaturedEventsProps = {
  items: FeaturedEvent[];
  onEventClick: (item: FeaturedEvent) => void;
  onJoinClick: (item: FeaturedEvent) => void;
  onEventPreload?: (item: FeaturedEvent) => void;
};

export const HomeFeaturedEvents: FC<HomeFeaturedEventsProps> = ({
  items,
  onEventClick,
  onJoinClick,
  onEventPreload,
}) => {
  const { loggedIn } = useAuthSession();

  if (items.length === 0) {
    return (
      <View className="s-home-showcase" aria-label="热门活动">
        <View className="s-home-showcase__head">
          <Text className="s-home-showcase__title">热门活动</Text>
        </View>
        <Text className="s-home-showcase__empty">暂无进行中的活动</Text>
      </View>
    );
  }

  return (
    <View className="s-home-showcase" aria-label="热门活动">
      <View className="s-home-showcase__head">
        <Text className="s-home-showcase__title">🎪 热门活动</Text>
        <View
          className="s-home-showcase__all"
          onClick={() => goEventsListTab()}
          role="button"
          aria-label="查看全部活动"
        >
          <Text className="s-home-showcase__all-text">全部</Text>
          <ChevronRight size={14} color="var(--primary)" />
        </View>
      </View>

      <Swiper
        className="s-home-showcase__swiper"
        indicatorDots={items.length > 1}
        indicatorColor="rgba(255, 255, 255, 0.25)"
        indicatorActiveColor="var(--primary)"
        circular={items.length > 1}
        previousMargin="12px"
        nextMargin="12px"
      >
        {items.map((event, index) => (
          <SwiperItem key={event.id}>
            <HomeFeaturedEventCard
              event={event}
              index={index}
              loggedIn={loggedIn}
              onEventClick={onEventClick}
              onJoinClick={onJoinClick}
              onEventPreload={onEventPreload}
            />
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  );
};

function HomeFeaturedEventCard({
  event,
  index,
  loggedIn,
  onEventClick,
  onJoinClick,
  onEventPreload,
}: {
  event: FeaturedEvent;
  index: number;
  loggedIn: boolean;
  onEventClick: (item: FeaturedEvent) => void;
  onJoinClick: (item: FeaturedEvent) => void;
  onEventPreload?: (item: FeaturedEvent) => void;
}) {
  const status = getActivityStatusFromActivity(event.date, event.title);
  const venue = event.venue?.trim() ?? '';
  const legacyId = resolveFeaturedEventLegacyId(event);
  const isJoinNavigating = useRouteTransitionActive(legacyId ?? undefined);
  const heroSrc =
    featuredPostImageUrl(event.image, 720) ??
    thumbnailImageUrl(event.image, 480) ??
    event.image;
  const showJoined = loggedIn && event.going;
  const categoryLabel = formatActivityCategoryLabel(event.category);

  const handlePreload = () => {
    if (legacyId == null) return;
    onEventPreload?.(event);
  };

  const joinLabel = (() => {
    if (isJoinNavigating) return '加入中…';
    if (status === 'ended') return '已结束';
    if (showJoined) return '已加入';
    return '立即参与';
  })();

  const openDetail = () => {
    if (legacyId == null) return;
    onEventClick(event);
  };

  return (
    <View
      className={[
        's-home-showcase-card',
        activityStatusCardClass(status),
        showJoined && 's-home-showcase-card--joined',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      aria-label={`查看${event.title}`}
      onTouchStart={handlePreload}
      onClick={openDetail}
    >
      <ImageWithFallback
        src={heroSrc}
        alt={event.title}
        priority={index === 0}
        wrapperClassName="s-home-showcase-card__media"
        imageClassName="s-home-showcase-card__media-img"
        fallbackWrapperClassName="s-home-showcase-card__media s-home-showcase-card__media--fallback"
        fallback={
          <Text className="s-home-showcase-card__media-fallback">{event.title}</Text>
        }
      />
      <View className="s-home-showcase-card__shade" />

      <View className="s-home-showcase-card__tags">
        <View className="s-home-showcase-card__tag s-home-showcase-card__tag--category">
          <Text className="s-home-showcase-card__tag-text">{categoryLabel}</Text>
        </View>
        {event.isHot ? (
          <View className="s-home-showcase-card__tag s-home-showcase-card__tag--hot">
            <Text className="s-home-showcase-card__tag-text">🔥 热门</Text>
          </View>
        ) : null}
      </View>

      <View className="s-home-showcase-card__body">
        <Text className="s-home-showcase-card__event-title">{event.title}</Text>
        <View className="s-home-showcase-card__meta-line">
          <Text className="s-home-showcase-card__date">{event.date}</Text>
          {venue ? (
            <>
              <Text className="s-home-showcase-card__at">at</Text>
              <Text className="s-home-showcase-card__venue">{venue}</Text>
            </>
          ) : null}
        </View>
      </View>

      <View className="s-home-showcase-card__footer">
        <View className="s-home-showcase-card__people">
          <View className="s-home-showcase-card__avatars" aria-hidden>
            {(event.guests ?? []).slice(0, 3).map((guest, guestIndex) => (
              <Image
                key={guest}
                src={thumbnailImageUrl(guest, 48) ?? guest}
                className="s-home-showcase-card__avatar"
                mode="aspectFill"
                lazyLoad
                style={{ zIndex: 3 - guestIndex }}
              />
            ))}
          </View>
          <Text className="s-home-showcase-card__count">{event.attendeeCount} 人</Text>
        </View>

        <Button
          className={[
            's-home-showcase-card__cta',
            showJoined && 's-home-showcase-card__cta--joined',
            isJoinNavigating && 's-home-showcase-card__cta--loading',
          ]
            .filter(Boolean)
            .join(' ')}
          disabled={status === 'ended' || isJoinNavigating || legacyId == null}
          onTouchStart={handlePreload}
          onClick={(clickEvent) => {
            clickEvent.stopPropagation();
            onJoinClick(event);
          }}
        >
          <Text className="s-home-showcase-card__cta-text">{joinLabel}</Text>
        </Button>
      </View>
    </View>
  );
}
