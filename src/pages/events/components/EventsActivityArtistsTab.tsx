import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { useCurrentUserQuery } from '../../../hooks/sync/profile';
import { useCatalogLineupArtists } from '../../../hooks/useSyncApi';
import { useBuddyMatchProfile } from '../../../hooks/useBuddyMatchProfile';
import { IMAGE_SIZE } from '../../../constants/imageSizes';
import { thumbnailImageUrl } from '../../../utils/imageUrl';
import { filterCatalogLineupArtists } from '../../../utils/filterCatalogLineupArtists';
import {
  buildCatalogArtistGenreChips,
  sortCatalogLineupArtistsByGenrePreference,
} from '../../../utils/catalogLineupArtistGenres';
import {
  catalogArtistLetterDomId,
  groupCatalogArtistsByNameLetter,
  sortCatalogLineupArtistsByName,
} from '../../../utils/catalogLineupArtistSort';
import { useCatalogArtistAlphabetNavigation } from '../hooks/useCatalogArtistAlphabetNavigation';
import { EventsArtistAlphabetIndex } from './EventsArtistAlphabetIndex';
import { EventsArtistCard } from './EventsArtistCard';
import { EventsArtistGenrePreferenceToggle } from './EventsArtistGenrePreferenceToggle';
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
  const [preferGenreSort, setPreferGenreSort] = useState(true);
  const preferenceInitializedRef = useRef(false);
  useCurrentUserQuery();
  const { data: artists, isLoading, isError, refetch } = useCatalogLineupArtists();
  const { favorGenres, hasGenrePreferences, hydrated } = useBuddyMatchProfile();
  const canSortByGenrePreference = hydrated && hasGenrePreferences;
  const useGenrePreferenceSort = canSortByGenrePreference && preferGenreSort;

  useEffect(() => {
    if (!hydrated || preferenceInitializedRef.current) {
      return;
    }
    setPreferGenreSort(hasGenrePreferences);
    preferenceInitializedRef.current = true;
  }, [hasGenrePreferences, hydrated]);

  const genreChips = useMemo(
    () => buildCatalogArtistGenreChips(artists ?? []),
    [artists],
  );

  const sortedArtists = useMemo(() => {
    const list = artists ?? [];
    if (useGenrePreferenceSort) {
      return sortCatalogLineupArtistsByGenrePreference(list, favorGenres);
    }
    return sortCatalogLineupArtistsByName(list);
  }, [artists, favorGenres, useGenrePreferenceSort]);

  const filteredArtists = useMemo(
    () =>
      filterCatalogLineupArtists(
        sortedArtists,
        artistSearchQuery,
        selectedGenre,
        useGenrePreferenceSort ? favorGenres : null,
      ),
    [
      sortedArtists,
      artistSearchQuery,
      selectedGenre,
      favorGenres,
      useGenrePreferenceSort,
    ],
  );

  const alphabetSections = useMemo(
    () =>
      useGenrePreferenceSort ? [] : groupCatalogArtistsByNameLetter(filteredArtists),
    [filteredArtists, useGenrePreferenceSort],
  );

  const availableLetters = useMemo(
    () => new Set(alphabetSections.map((section) => section.letter)),
    [alphabetSections],
  );

  const showAlphabetIndex = !useGenrePreferenceSort && filteredArtists.length > 0;
  const hasActiveFilters = Boolean(artistSearchQuery.trim() || selectedGenre);

  const { scrollTop, activeLetter, handleLetterTap, handleScroll } =
    useCatalogArtistAlphabetNavigation(alphabetSections, showAlphabetIndex);

  const handleOpenArtist = useCallback(
    (artistId: string) => {
      onOpenArtist(artistId);
    },
    [onOpenArtist],
  );

  const renderArtistCard = useCallback(
    (artist: (typeof filteredArtists)[number], rankTier = 0) => {
      const thumbSrc = artist.thumbnail
        ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.avatarMd, 1)
        : undefined;
      const backdropSrc = artist.thumbnail
        ? thumbnailImageUrl(artist.thumbnail, IMAGE_SIZE.listThumb, 1)
        : undefined;

      return (
        <EventsArtistCard
          key={artist.id}
          artist={artist}
          rankTier={rankTier}
          thumbSrc={thumbSrc}
          backdropSrc={backdropSrc}
          onOpenArtist={handleOpenArtist}
        />
      );
    },
    [handleOpenArtist],
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
        {canSortByGenrePreference && !hasActiveFilters ? (
          <EventsArtistGenrePreferenceToggle
            checked={preferGenreSort}
            onChange={setPreferGenreSort}
          />
        ) : null}
      </View>
      <View className="s-events__artists-body">
        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          scrollWithAnimation
          scrollTop={scrollTop}
          onScroll={showAlphabetIndex ? handleScroll : undefined}
          className={[
            's-events__artists-scroll',
            's-scrollbar-none',
            showAlphabetIndex ? 's-events__artists-scroll--with-index' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {filteredArtists.length ? (
            useGenrePreferenceSort ? (
              <View className="s-events__artists-grid">
                {filteredArtists.map((artist) => {
                  const originalIndex = sortedArtists.findIndex(
                    (item) => item.id === artist.id,
                  );
                  const rankTier =
                    !hasActiveFilters && originalIndex >= 0 && originalIndex < 3
                      ? originalIndex + 1
                      : 0;
                  return renderArtistCard(artist, rankTier);
                })}
              </View>
            ) : (
              <View className="s-events__artists-sections">
                {alphabetSections.map((section) => (
                  <View key={section.letter} className="s-events__artists-section">
                    <View
                      id={catalogArtistLetterDomId(section.letter)}
                      className="s-events__artists-letter-head"
                    >
                      <Text className="s-events__artists-letter-head-text">
                        {section.letter}
                      </Text>
                    </View>
                    <View className="s-events__artists-grid">
                      {section.artists.map((artist) => renderArtistCard(artist))}
                    </View>
                  </View>
                ))}
              </View>
            )
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
        {showAlphabetIndex ? (
          <EventsArtistAlphabetIndex
            availableLetters={availableLetters}
            activeLetter={activeLetter}
            onLetterTap={handleLetterTap}
          />
        ) : null}
      </View>
    </View>
  );
};
