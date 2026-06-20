import './HomeFeaturedEvents.scss';
import { type FC, useEffect, useState } from 'react';
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
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { goEventsListTab } from '../../../utils/route';
import { Image, Swiper, SwiperItem, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type HomeFeaturedEventsProps = {
  items: FeaturedEvent[];
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onEventClick: (item: FeaturedEvent) => void;
  onEventPreload?: (item: FeaturedEvent) => void;
};

export const HomeFeaturedEvents: FC<HomeFeaturedEventsProps> = ({
  items,
  activeIndex,
  onActiveIndexChange,
  onEventClick,
  onEventPreload,
}) => {
  const t = useT();
  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = activeIndex ?? internalIndex;
  const featuredTitle = `🎪 ${t('home.featuredTitle')}`;

  useEffect(() => {
    if (activeIndex === undefined) {
      setInternalIndex(0);
    }
  }, [items, activeIndex]);

  const handleSwiperChange = (index: number) => {
    onActiveIndexChange?.(index);
    if (activeIndex === undefined) {
      setInternalIndex(index);
    }
  };

  if (items.length === 0) {
    return (
      <View className="s-home-showcase" aria-label={t('home.featuredTitle')}>
        <View className="s-home-showcase__head">
          <Text className="s-home-showcase__title">{featuredTitle}</Text>
          <View
            className="s-home-showcase__all"
            onClick={() => goEventsListTab()}
            role="button"
            aria-label={t('common.viewAllEvents')}
          >
            <Text className="s-home-showcase__all-text">{t('common.all')}</Text>
            <ChevronRight size={14} color="var(--primary)" />
          </View>
        </View>
        <View className="s-home-showcase__empty-wrap">
          <Text className="s-home-showcase__empty">{t('home.featuredEmpty')}</Text>
          <Text className="s-home-showcase__empty-hint">
            {t('home.featuredEmptyHint')}
          </Text>
          <Button
            className="s-home-showcase__empty-btn"
            onClick={() => goEventsListTab()}
          >
            <Text className="s-home-showcase__empty-btn-text">
              {t('home.featuredBrowse')}
            </Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="s-home-showcase" aria-label={t('home.featuredTitle')}>
      <View className="s-home-showcase__head">
        <Text className="s-home-showcase__title">{featuredTitle}</Text>
        <View
          className="s-home-showcase__all"
          onClick={() => goEventsListTab()}
          role="button"
          aria-label={t('common.viewAllEvents')}
        >
          <Text className="s-home-showcase__all-text">{t('common.all')}</Text>
          <ChevronRight size={14} color="var(--primary)" />
        </View>
      </View>

      <Swiper
        className="s-home-showcase__swiper"
        current={currentIndex}
        onChange={(event) => handleSwiperChange(event.detail.current)}
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
              onEventClick={onEventClick}
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
  onEventClick,
  onEventPreload,
}: {
  event: FeaturedEvent;
  index: number;
  onEventClick: (item: FeaturedEvent) => void;
  onEventPreload?: (item: FeaturedEvent) => void;
}) {
  const t = useT();
  const status = getActivityStatusFromActivity(event.date, event.title);
  const venue = event.venue?.trim() ?? '';
  const legacyId = resolveFeaturedEventLegacyId(event);
  const heroSrc =
    featuredPostImageUrl(event.image, IMAGE_SIZE.featuredHero) ??
    thumbnailImageUrl(event.image, 480) ??
    event.image;
  const categoryLabel = formatActivityCategoryLabel(event.category);

  const handlePreload = () => {
    if (legacyId == null) return;
    onEventPreload?.(event);
  };

  const openDetail = () => {
    if (legacyId == null) return;
    onEventClick(event);
  };

  return (
    <View
      className={['s-home-showcase-card', activityStatusCardClass(status)]
        .filter(Boolean)
        .join(' ')}
      role="button"
      aria-label={t('home.viewEventAria', { title: event.title })}
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
            <Text className="s-home-showcase-card__tag-text">🔥 {t('common.hot')}</Text>
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
          {(event.guests ?? []).length > 0 ? (
            <View className="s-home-showcase-card__avatars" aria-hidden>
              {(event.guests ?? []).slice(0, 3).map((guest, guestIndex) => (
                <Image
                  key={guest}
                  src={thumbnailImageUrl(guest, IMAGE_SIZE.avatarSm) ?? guest}
                  className="s-home-showcase-card__avatar"
                  mode="aspectFill"
                  lazyLoad
                  style={{ zIndex: 3 - guestIndex }}
                />
              ))}
            </View>
          ) : null}
          <Text className="s-home-showcase-card__count">
            {t('common.people', { count: event.attendeeCount })}
          </Text>
        </View>
      </View>
    </View>
  );
}
