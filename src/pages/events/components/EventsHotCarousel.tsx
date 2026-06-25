import type { FC } from 'react';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import { formatEventHeroMetaLine } from '../../../utils/eventCardDisplay';
import { formatActivityAreaLabel } from '../../../utils/filterActivitiesForEventsCatalog';
import type { EventCardUi } from '../../../utils/apiMappers';
import { thumbnailImageUrl } from '../../../utils/imageUrl';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

type EventsHotCarouselProps = {
  events: EventCardUi[];
  onOpenDetail: (legacyId: string) => void;
  onWarmDetail: (event: EventCardUi) => void;
};

export const EventsHotCarousel: FC<EventsHotCarouselProps> = ({
  events,
  onOpenDetail,
  onWarmDetail,
}) => {
  const t = useT();

  if (events.length === 0) {
    return null;
  }

  return (
    <View data-cmp="EventsHotCarousel" className="s-events-hot-carousel">
      <View className="s-events-hot-carousel__title">
        <Text>{t('events.hotCarouselTitle')}</Text>
      </View>
      <ScrollView
        scrollX
        showScrollbar={false}
        className="s-events-hot-carousel__scroll"
      >
        <View className="s-events-hot-carousel__track">
          {events.map((event) => {
            const regionLabel = formatActivityAreaLabel(event);
            const metaLine = formatEventHeroMetaLine(event.date, event.location);
            const thumbSrc = thumbnailImageUrl(event.image, IMAGE_SIZE.eventCardList);

            return (
              <View
                key={event.id}
                className="s-events-hot-carousel__card"
                role="button"
                onTouchStart={() => onWarmDetail(event)}
                onClick={() => onOpenDetail(event.id)}
              >
                <ImageWithFallback
                  src={thumbSrc}
                  alt={event.title}
                  imageClassName="s-events-hot-carousel__card-img"
                  placeholderClassName="s-events-hot-carousel__card-img s-events-hot-carousel__card-img--placeholder"
                  fallback={event.title.slice(0, 2)}
                />
                <View className="s-events-hot-carousel__card-shade" aria-hidden />
                {regionLabel ? (
                  <Text className="s-events-hot-carousel__card-region">
                    {regionLabel}
                  </Text>
                ) : null}
                <View className="s-events-hot-carousel__card-body">
                  <Text className="s-events-hot-carousel__card-title">
                    {event.title}
                  </Text>
                  {metaLine ? (
                    <Text className="s-events-hot-carousel__card-meta">{metaLine}</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};
