import { useMemo, useState, type FC } from 'react';
import { Text, View } from '@tarojs/components';
import ActionSheet from '@/components/ActionSheet';
import { Check, ChevronDown } from '@/components/icons';
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
  onArtistPress?: (artistId: string) => void;
  voteMode?: boolean;
  selectedArtistIds?: string[];
  voteCountByArtistId?: Map<string, number>;
};

export const LineupArtistGrid: FC<LineupArtistGridProps> = ({
  artists,
  sortMode,
  onSortModeChange,
  showSoloSort = false,
  onArtistPress,
  voteMode = false,
  selectedArtistIds = [],
  voteCountByArtistId,
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
              {group.artists.map((artist) => {
                const selectionIndex = selectedArtistIds.indexOf(artist.id);
                const isSelected = voteMode && selectionIndex >= 0;
                const accentVariant =
                  isSelected && selectionIndex % 2 === 1 ? 'purple' : 'pink';
                const voteCount = voteCountByArtistId?.get(artist.id);

                return (
                  <View
                    key={artist.id}
                    className={[
                      's-activity-lineup__artist-card',
                      onArtistPress
                        ? 's-activity-lineup__artist-card--interactive'
                        : '',
                      isSelected && accentVariant === 'pink'
                        ? 's-activity-lineup__artist-card--vote-pink'
                        : '',
                      isSelected && accentVariant === 'purple'
                        ? 's-activity-lineup__artist-card--vote-purple'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    hoverClass={
                      onArtistPress ? 's-activity-lineup__artist-card--pressed' : ''
                    }
                    onClick={onArtistPress ? () => onArtistPress(artist.id) : undefined}
                    style={
                      isSelected
                        ? undefined
                        : {
                            borderColor: group.accentColor,
                            boxShadow: `0 0 0 1px ${group.accentColor}33`,
                          }
                    }
                  >
                    {isSelected ? (
                      <View
                        className={[
                          's-activity-lineup__artist-check',
                          accentVariant === 'purple'
                            ? 's-activity-lineup__artist-check--purple'
                            : 's-activity-lineup__artist-check--pink',
                        ].join(' ')}
                        aria-hidden
                      >
                        <Check size={13} color="#fff" strokeWidth={3} />
                      </View>
                    ) : null}
                    <Text className="s-activity-lineup__artist-name">
                      {artist.name}
                    </Text>
                    {artist.genreLabel ? (
                      <Text
                        className="s-activity-lineup__artist-genre"
                        style={{ color: isSelected ? undefined : group.accentColor }}
                      >
                        {artist.genreLabel}
                      </Text>
                    ) : null}
                    {voteMode && voteCount != null && voteCount > 0 ? (
                      <View
                        className={[
                          's-activity-lineup__artist-vote-badge',
                          isSelected && accentVariant === 'purple'
                            ? 's-activity-lineup__artist-vote-badge--purple'
                            : isSelected
                              ? 's-activity-lineup__artist-vote-badge--pink'
                              : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        style={
                          !isSelected
                            ? {
                                borderColor: `${group.accentColor}66`,
                                background: `${group.accentColor}1f`,
                              }
                            : undefined
                        }
                      >
                        <Text
                          className="s-activity-lineup__artist-vote-count"
                          style={!isSelected ? { color: group.accentColor } : undefined}
                        >
                          {t('setVote.cardVoteCount', { count: voteCount })}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
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
