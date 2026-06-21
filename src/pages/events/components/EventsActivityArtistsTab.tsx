import type { FC } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useCatalogLineupArtists } from '../../../hooks/useSyncApi';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { thumbnailImageUrl } from '../../../utils/imageUrl';

type EventsActivityArtistsTabProps = {
  listHeight?: number;
};

export const EventsActivityArtistsTab: FC<EventsActivityArtistsTabProps> = ({
  listHeight,
}) => {
  const t = useT();
  const { data: artists, isLoading, isError, refetch } = useCatalogLineupArtists();

  if (isLoading && !artists?.length) {
    return (
      <View
        className="s-events__main s-events__main--artists"
        style={listHeight != null ? { height: `${listHeight}px` } : undefined}
      >
        <ThemedPageLoader variant="skeleton-feed" minHeight={280} />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        className="s-events__main s-events__main--artists"
        style={listHeight != null ? { height: `${listHeight}px` } : undefined}
      >
        <View className="s-events__artists-state">
          <Text className="s-events__artists-state-text">
            {t('events.artistsLoadFailed')}
          </Text>
          <Text
            className="s-events__artists-state-action"
            onClick={() => void refetch()}
          >
            {t('common.retry')}
          </Text>
        </View>
      </View>
    );
  }

  if (!artists?.length) {
    return (
      <View
        className="s-events__main s-events__main--artists"
        style={listHeight != null ? { height: `${listHeight}px` } : undefined}
      >
        <View className="s-events__artists-state">
          <Text className="s-events__artists-state-text">
            {t('events.artistsEmpty')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      scrollY
      enhanced
      showScrollbar={false}
      className="s-events__main s-events__main--artists s-scrollbar-none"
      style={listHeight != null ? { height: `${listHeight}px` } : undefined}
    >
      <View className="s-events__artists-grid">
        {artists.map((artist, index) => {
          const thumbSrc = artist.thumbnail
            ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.avatarMd, 1)
            : undefined;

          return (
            <View key={artist.id} className="s-events__artist-card">
              <View className="s-events__artist-rank">
                <Text className="s-events__artist-rank-text">{index + 1}</Text>
              </View>
              <View className="s-events__artist-avatar-wrap">
                <ImageWithFallback
                  src={thumbSrc}
                  alt={artist.name}
                  wrapperClassName="s-events__artist-avatar"
                  imageClassName="s-events__artist-avatar-img"
                  fallbackWrapperClassName="s-events__artist-avatar s-events__artist-avatar--fallback"
                  fallback={artist.name.slice(0, 2)}
                />
              </View>
              <View className="s-events__artist-info">
                <Text className="s-events__artist-name s-line-clamp-2">
                  {artist.name}
                </Text>
                <Text className="s-events__artist-genre s-line-clamp-1">
                  {artist.genreLabel}
                </Text>
                <Text className="s-events__artist-count">
                  {t('events.artistActivityCount', { count: artist.activityCount })}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};
