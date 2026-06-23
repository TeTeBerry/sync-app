import type { FC } from 'react';
import { useCallback } from 'react';
import { ScrollView, Text, View, Image } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useCatalogLineupArtists } from '../../../hooks/useSyncApi';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { thumbnailImageUrl } from '../../../utils/imageUrl';

const MAX_VISIBLE_GENRE_CHIPS = 4;

function splitArtistGenreChips(genreLabel: string): string[] {
  const parts = genreLabel
    .split(/\s*[·•|/]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length ? parts : [genreLabel.trim()].filter(Boolean);
}

type EventsActivityArtistsTabProps = {
  listHeight?: number;
  onOpenArtist: (artistId: string) => void;
};

export const EventsActivityArtistsTab: FC<EventsActivityArtistsTabProps> = ({
  listHeight,
  onOpenArtist,
}) => {
  const t = useT();
  const { data: artists, isLoading, isError, refetch } = useCatalogLineupArtists();

  const handleOpenArtist = useCallback(
    (artistId: string) => {
      onOpenArtist(artistId);
    },
    [onOpenArtist],
  );

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
    <>
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
            const backdropSrc = artist.thumbnail
              ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.listThumb, 1)
              : undefined;
            const rankTier = index < 3 ? index + 1 : 0;
            const genreChips = artist.genreLabel
              ? splitArtistGenreChips(artist.genreLabel)
              : [];
            const visibleGenreChips = genreChips.slice(0, MAX_VISIBLE_GENRE_CHIPS);
            const hiddenGenreCount = genreChips.length - visibleGenreChips.length;

            return (
              <View
                key={artist.id}
                className={[
                  's-events__artist-card',
                  rankTier > 0 ? `s-events__artist-card--rank-${rankTier}` : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                hoverClass="s-events__artist-card--pressed"
                onClick={() => handleOpenArtist(artist.id)}
              >
                {backdropSrc ? (
                  <View className="s-events__artist-card-backdrop" aria-hidden>
                    <Image
                      src={backdropSrc}
                      className="s-events__artist-card-backdrop-img"
                      mode="aspectFill"
                    />
                    <View
                      className={[
                        's-events__artist-card-backdrop-scrim',
                        rankTier > 0
                          ? `s-events__artist-card-backdrop-scrim--rank-${rankTier}`
                          : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  </View>
                ) : null}
                <View className="s-events__artist-avatar-stage">
                  <View className="s-events__artist-avatar-glow" aria-hidden />
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
                </View>
                <View className="s-events__artist-info">
                  <Text className="s-events__artist-name s-line-clamp-2">
                    {artist.name}
                  </Text>
                  {visibleGenreChips.length ? (
                    <View className="s-events__artist-genres">
                      {visibleGenreChips.map((chip, chipIndex) => (
                        <View
                          key={`${chip}-${chipIndex}`}
                          className="s-events__artist-genre-chip"
                        >
                          <Text className="s-events__artist-genre-chip-text">
                            {chip}
                          </Text>
                        </View>
                      ))}
                      {hiddenGenreCount > 0 ? (
                        <View className="s-events__artist-genre-chip s-events__artist-genre-chip--more">
                          <Text className="s-events__artist-genre-chip-text">
                            {t('events.artistGenreMore', {
                              count: hiddenGenreCount,
                            })}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                  <View className="s-events__artist-stats">
                    <Text className="s-events__artist-count">
                      {t('events.artistActivityCount', {
                        count: artist.activityCount,
                      })}
                    </Text>
                  </View>
                </View>
                {artist.nextActivity ? (
                  <View className="s-events__artist-next-strip">
                    <Text className="s-events__artist-next-kicker">
                      {t('events.artistNextKicker')}
                    </Text>
                    <Text className="s-events__artist-next-value s-line-clamp-1">
                      {artist.nextActivity.name}
                    </Text>
                    <Text className="s-events__artist-next-date">
                      {artist.nextActivity.date}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
};
