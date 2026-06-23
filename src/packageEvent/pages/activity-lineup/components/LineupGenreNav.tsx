import { useMemo, useState, type FC } from 'react';
import { ScrollView, Text, View } from '@tarojs/components';
import ActionSheet from '@/components/ActionSheet';
import { ChevronDown } from '@/components/icons';
import { Button } from '@/components/ui';
import { useT } from '@/hooks/useI18n';
import type { ItineraryDj } from '@/types/itinerary';
import {
  groupLineupByPrimaryGenre,
  LINEUP_OTHER_GENRE_ID,
} from '../utils/groupLineupByPrimaryGenre';
import { LINEUP_GENRE_NAV_DOM_ID } from '../utils/lineupGenreSectionDomId';
import type { LineupArtistSortMode } from '../utils/sortLineupArtists';

type LineupGenreNavProps = {
  artists: ItineraryDj[];
  activeGenreId: string;
  sortMode: LineupArtistSortMode;
  onSortModeChange: (mode: LineupArtistSortMode) => void;
  onGenreChipTap: (chipId: string) => void;
};

type GenreFilterChip = {
  id: string;
  label: string;
  count: number;
  accentColor?: string;
};

const SORT_MODES: LineupArtistSortMode[] = ['popularity', 'name'];

export const LineupGenreNav: FC<LineupGenreNavProps> = ({
  artists,
  activeGenreId,
  sortMode,
  onSortModeChange,
  onGenreChipTap,
}) => {
  const t = useT();
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const genreGroups = useMemo(() => groupLineupByPrimaryGenre(artists), [artists]);

  const filterChips = useMemo<GenreFilterChip[]>(
    () => [
      { id: 'all', label: t('activityLineup.allGenres'), count: artists.length },
      ...genreGroups.map((group) => ({
        id: group.id,
        label:
          group.id === LINEUP_OTHER_GENRE_ID
            ? t('activityLineup.otherGenre')
            : group.label,
        count: group.artists.length,
        accentColor: group.accentColor,
      })),
    ],
    [artists.length, genreGroups, t],
  );

  const sortModeLabel =
    sortMode === 'name'
      ? t('activityLineup.sortByName')
      : t('activityLineup.sortByPopularity');

  const sortSheetItems = useMemo(
    () =>
      SORT_MODES.map((mode) => ({
        label:
          mode === 'name'
            ? t('activityLineup.sortByName')
            : t('activityLineup.sortByPopularity'),
        active: sortMode === mode,
        onSelect: () => {
          onSortModeChange(mode);
          setSortSheetOpen(false);
        },
      })),
    [onSortModeChange, sortMode, t],
  );

  if (genreGroups.length <= 1) {
    return null;
  }

  return (
    <>
      <View id={LINEUP_GENRE_NAV_DOM_ID} className="s-activity-lineup__genre-nav">
        <View className="s-activity-lineup__genre-nav-head">
          <Text className="s-activity-lineup__genre-nav-label">
            {t('activityLineup.genreFilter')}
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
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className="s-activity-lineup__genre-chip-scroll s-scrollbar-none"
        >
          <View className="s-activity-lineup__genre-chip-row">
            {filterChips.map((chip) => {
              const active = activeGenreId === chip.id;
              const accent = chip.accentColor ?? 'var(--primary)';
              return (
                <Button
                  key={chip.id}
                  className={[
                    's-activity-lineup__genre-chip',
                    active ? 's-activity-lineup__genre-chip--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={
                    active
                      ? {
                          background: chip.id === 'all' ? 'var(--primary)' : accent,
                        }
                      : undefined
                  }
                  hoverClass="s-activity-lineup__genre-chip--pressed"
                  onTap={() => onGenreChipTap(chip.id)}
                >
                  <Text className="s-activity-lineup__genre-chip-label">
                    {chip.label}
                  </Text>
                  <Text className="s-activity-lineup__genre-chip-count">
                    {chip.count}
                  </Text>
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <ActionSheet
        open={sortSheetOpen}
        title={t('activityLineup.sortTitle')}
        items={sortSheetItems}
        cancelLabel={t('common.cancel')}
        onCancel={() => setSortSheetOpen(false)}
      />
    </>
  );
};
