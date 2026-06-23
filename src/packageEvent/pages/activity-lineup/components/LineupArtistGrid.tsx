import { useMemo, useState, type FC } from 'react';
import { Text, View } from '@tarojs/components';
import ActionSheet from '@/components/ActionSheet';
import { ChevronDown } from '@/components/icons';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import type { ItineraryDj } from '@/types/itinerary';
import {
  groupLineupByPrimaryGenre,
  LINEUP_OTHER_GENRE_ID,
} from '../utils/groupLineupByPrimaryGenre';
import {
  lineupGenreHeadDomId,
  lineupGenreSectionDomId,
} from '../utils/lineupGenreSectionDomId';
import {
  sortLineupArtists,
  type LineupArtistSortMode,
} from '../utils/sortLineupArtists';

type LineupArtistGridProps = {
  artists: ItineraryDj[];
  sortMode: LineupArtistSortMode;
  onSortModeChange?: (mode: LineupArtistSortMode) => void;
  showSoloSort?: boolean;
};

export const LineupArtistGrid: FC<LineupArtistGridProps> = ({
  artists,
  sortMode,
  onSortModeChange,
  showSoloSort = false,
}) => {
  const t = useT();
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const sortedArtists = useMemo(
    () => sortLineupArtists(artists, sortMode),
    [artists, sortMode],
  );

  const genreGroups = useMemo(
    () => groupLineupByPrimaryGenre(sortedArtists),
    [sortedArtists],
  );

  const sortModeLabel =
    sortMode === 'name'
      ? t('activityLineup.sortByName')
      : t('activityLineup.sortByPopularity');

  if (genreGroups.length === 0) {
    return null;
  }

  return (
    <View className="s-activity-lineup__lineup">
      {showSoloSort ? (
        <View className="s-activity-lineup__genre-nav-head s-activity-lineup__genre-nav-head--solo">
          <Text className="s-activity-lineup__list-count">
            {t('activityLineup.artistCount', { count: artists.length })}
          </Text>
          <Button
            className="s-activity-lineup__sort-btn"
            hoverClass="s-activity-lineup__sort-btn--pressed"
            onTap={() => setSortSheetOpen(true)}
          >
            <Text className="s-activity-lineup__sort-btn-text">{sortModeLabel}</Text>
            <ChevronDown size={14} color="var(--primary)" aria-hidden />
          </Button>
        </View>
      ) : null}

      {genreGroups.map((group) => {
        const sectionLabel =
          group.id === LINEUP_OTHER_GENRE_ID
            ? t('activityLineup.otherGenre')
            : group.label;
        const sectionDomId = lineupGenreSectionDomId(group.id);
        const headDomId = lineupGenreHeadDomId(group.id);

        return (
          <View
            key={group.id}
            id={sectionDomId}
            className="s-activity-lineup__genre-section"
          >
            <View id={headDomId} className="s-activity-lineup__genre-head">
              <View
                className="s-activity-lineup__genre-accent"
                style={{ background: group.accentColor }}
                aria-hidden
              />
              <Text className="s-activity-lineup__genre-title">{sectionLabel}</Text>
              <Text className="s-activity-lineup__genre-count">
                {t('activityLineup.artistCount', { count: group.artists.length })}
              </Text>
            </View>

            <View className="s-activity-lineup__artist-grid">
              {group.artists.map((artist) => (
                <View
                  key={artist.id}
                  className="s-activity-lineup__artist-card"
                  style={{
                    borderColor: group.accentColor,
                    boxShadow: `0 0 0 1px ${group.accentColor}33`,
                  }}
                >
                  <Text className="s-activity-lineup__artist-name">{artist.name}</Text>
                  {artist.genreLabel ? (
                    <Text
                      className="s-activity-lineup__artist-genre"
                      style={{ color: group.accentColor }}
                    >
                      {artist.genreLabel}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {showSoloSort && onSortModeChange ? (
        <ActionSheet
          open={sortSheetOpen}
          title={t('activityLineup.sortTitle')}
          items={(['popularity', 'name'] as const).map((mode) => ({
            label:
              mode === 'name'
                ? t('activityLineup.sortByName')
                : t('activityLineup.sortByPopularity'),
            active: sortMode === mode,
            onSelect: () => {
              onSortModeChange(mode);
              setSortSheetOpen(false);
            },
          }))}
          cancelLabel={t('common.cancel')}
          onCancel={() => setSortSheetOpen(false)}
        />
      ) : null}
    </View>
  );
};
