import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, Text, View, Image } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import { ImageWithFallback } from '../../../components/ImageWithFallback';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import {
  useCatalogLineupArtists,
  useCurrentUserQuery,
} from '../../../hooks/useSyncApi';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { thumbnailImageUrl } from '../../../utils/imageUrl';
import { filterCatalogLineupArtists } from '../../../utils/filterCatalogLineupArtists';
import {
  buildCatalogArtistGenreChips,
  getCatalogArtistPrimaryGenreLabel,
  sortCatalogLineupArtistsByGenrePreference,
} from '../../../utils/catalogLineupArtistGenres';
import { EventsSearchBar } from './EventsSearchBar';
import { EventsArtistGenreChips } from './EventsArtistGenreChips';

type EventsActivityArtistsTabProps = {
  listHeight?: number;
  onOpenArtist: (artistId: string) => void;
};

export const EventsActivityArtistsTab: FC<EventsActivityArtistsTabProps> = ({
  listHeight,
  onOpenArtist,
}) => {
  const t = useT();
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const { data: artists, isLoading, isError, refetch } = useCatalogLineupArtists();
  const { data: currentUser } = useCurrentUserQuery();
  const favorGenres = currentUser?.favorGenres;

  const genreChips = useMemo(
    () => buildCatalogArtistGenreChips(artists ?? []),
    [artists],
  );

  const rankedArtists = useMemo(
    () => sortCatalogLineupArtistsByGenrePreference(artists ?? [], favorGenres),
    [artists, favorGenres],
  );

  const filteredArtists = useMemo(
    () =>
      filterCatalogLineupArtists(
        rankedArtists,
        artistSearchQuery,
        selectedGenre,
        favorGenres,
      ),
    [rankedArtists, artistSearchQuery, selectedGenre, favorGenres],
  );

  const hasActiveFilters = Boolean(artistSearchQuery.trim() || selectedGenre);
  const showGenrePreferenceInsight = Boolean(favorGenres?.length) && !hasActiveFilters;

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
    <View
      className="s-events__main s-events__main--artists"
      style={listHeight != null ? { height: `${listHeight}px` } : undefined}
    >
      <View className="s-events__artists-toolbar">
        <EventsSearchBar
          value={artistSearchQuery}
          onChange={setArtistSearchQuery}
          placeholder={t('events.artistsSearchPlaceholder')}
          ariaLabel={t('events.artistsSearchAria')}
        />
        <EventsArtistGenreChips
          chips={genreChips}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
        />
        {showGenrePreferenceInsight ? (
          <Text className="s-events__artists-preference-insight">
            {t('events.artistsGenrePreferenceInsight')}
          </Text>
        ) : null}
      </View>
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-events__artists-scroll s-scrollbar-none"
      >
        {filteredArtists.length ? (
          <View className="s-events__artists-grid">
            {filteredArtists.map((artist) => {
              const originalIndex =
                rankedArtists.findIndex((item) => item.id === artist.id) ?? -1;
              const rankTier =
                !hasActiveFilters && originalIndex >= 0 && originalIndex < 3
                  ? originalIndex + 1
                  : 0;
              const thumbSrc = artist.thumbnail
                ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.avatarMd, 1)
                : undefined;
              const backdropSrc = artist.thumbnail
                ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.listThumb, 1)
                : undefined;
              const primaryGenre = getCatalogArtistPrimaryGenreLabel(artist) || null;
              const chineseAliases = artist.chineseAliases ?? [];

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
                    {chineseAliases.length ? (
                      <Text className="s-events__artist-aliases s-line-clamp-1">
                        {chineseAliases.join('、')}
                      </Text>
                    ) : null}
                    {primaryGenre ? (
                      <View className="s-events__artist-genres">
                        <View className="s-events__artist-genre-chip">
                          <Text className="s-events__artist-genre-chip-text s-line-clamp-1">
                            {primaryGenre}
                          </Text>
                        </View>
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
        ) : (
          <View className="s-events__artists-state s-events__artists-state--search">
            <Text className="s-events__artists-state-text">
              {artistSearchQuery.trim() && selectedGenre
                ? t('events.artistsFilterEmpty')
                : selectedGenre
                  ? t('events.artistsGenreFilterEmpty')
                  : t('events.artistsSearchEmpty')}
            </Text>
            <Text className="s-events__artists-state-hint">
              {artistSearchQuery.trim() && selectedGenre
                ? t('events.artistsFilterEmptyHint')
                : selectedGenre
                  ? t('events.artistsGenreFilterEmptyHint')
                  : t('events.artistsSearchEmptyHint')}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
