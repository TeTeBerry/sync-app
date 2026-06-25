import React from 'react';
import { Check, ChevronDown, Search, X } from '../../../../components/icons';
import { Button, Input } from '../../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import type { ExclusiveItineraryFilterChip } from '../exclusiveItineraryFilters';
import type { ExclusiveItineraryDj } from '../types';
import type { LineupArtistSortMode } from '../../activity-lineup/utils/sortLineupArtists';
import { itineraryDjCardDomId } from '@/domains/performance-itinerary';

export type ExclusiveItineraryDjGridProps = {
  selectedCount: number;
  stageFilter: string;
  genreFilter: string;
  styleSearchQuery: string;
  stageOptions: ExclusiveItineraryFilterChip[];
  genreOptions: ExclusiveItineraryFilterChip[];
  sortMode: LineupArtistSortMode;
  filteredDjs: ExclusiveItineraryDj[];
  selectedIds: string[];
  onStageFilterChange: (stageId: string) => void;
  onGenreFilterChange: (genreId: string) => void;
  onStyleSearchQueryChange: (query: string) => void;
  onOpenSortSheet: () => void;
  onToggleDj: (id: string) => void;
};

const ExclusiveItineraryDjGrid: React.FC<ExclusiveItineraryDjGridProps> = ({
  selectedCount,
  stageFilter,
  genreFilter,
  styleSearchQuery,
  stageOptions,
  genreOptions,
  sortMode,
  filteredDjs,
  selectedIds,
  onStageFilterChange,
  onGenreFilterChange,
  onStyleSearchQueryChange,
  onOpenSortSheet,
  onToggleDj,
}) => {
  const t = useT();
  const sortModeLabel =
    sortMode === 'name'
      ? t('activityLineup.sortByName')
      : t('activityLineup.sortByPopularity');

  return (
    <>
      <View className="s-exclusive-itinerary__step">
        <Text className="s-exclusive-itinerary__step-title">
          {t('itinerary.step1Title')}
        </Text>
        <Text className="s-exclusive-itinerary__step-badge">
          {t('itinerary.step1Badge', { count: selectedCount })}
        </Text>
      </View>

      <View className="s-exclusive-itinerary__filter-block">
        <Text className="s-exclusive-itinerary__filter-label">
          {t('itinerary.stageFilter')}
        </Text>
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className="s-exclusive-itinerary__chip-scroll s-scrollbar-none"
        >
          <View className="s-exclusive-itinerary__chip-row">
            {stageOptions.map((stage) => {
              const active = stageFilter === stage.id;
              return (
                <Button
                  key={stage.id}
                  className={[
                    's-exclusive-itinerary__chip',
                    active ? 's-exclusive-itinerary__chip--stage-on' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  hoverClass="s-exclusive-itinerary__chip--pressed"
                  onTap={() => onStageFilterChange(stage.id)}
                >
                  {stage.label}
                  {active ? <Check size={14} color="#ffffff" aria-hidden /> : null}
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className="s-exclusive-itinerary__filter-block">
        <Text className="s-exclusive-itinerary__filter-label">
          {t('itinerary.genreFilter')}
        </Text>
        <View className="s-exclusive-itinerary__style-search">
          <Search size={16} color="#8e8e93" aria-hidden />
          <Input
            className="s-exclusive-itinerary__style-search-input"
            placeholder={t('itinerary.searchPlaceholder')}
            placeholderClass="s-exclusive-itinerary__style-search-placeholder"
            value={styleSearchQuery}
            confirmType="search"
            onInput={(event) => onStyleSearchQueryChange(event.detail.value)}
            onConfirm={(event) => onStyleSearchQueryChange(event.detail.value)}
          />
          {styleSearchQuery.trim() ? (
            <View
              className="s-exclusive-itinerary__style-search-clear"
              hoverClass="s-exclusive-itinerary__style-search-clear--pressed"
              hoverStayTime={80}
              aria-label={t('itinerary.clearStyleSearchAria')}
              onClick={() => onStyleSearchQueryChange('')}
            >
              <X size={14} color="#8e8e93" aria-hidden />
            </View>
          ) : null}
        </View>
        <ScrollView
          scrollX
          enhanced
          showScrollbar={false}
          className="s-exclusive-itinerary__chip-scroll s-scrollbar-none"
        >
          <View className="s-exclusive-itinerary__chip-row">
            {genreOptions.map((genre) => {
              const active = genreFilter === genre.id;
              return (
                <Button
                  key={genre.id}
                  className={[
                    's-exclusive-itinerary__chip',
                    active ? 's-exclusive-itinerary__chip--genre-on' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  hoverClass="s-exclusive-itinerary__chip--pressed"
                  onTap={() => onGenreFilterChange(genre.id)}
                >
                  {genre.label}
                  {active ? <Check size={14} color="#ffffff" aria-hidden /> : null}
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className="s-exclusive-itinerary__list-head">
        <Text className="s-exclusive-itinerary__list-count">
          {t('itinerary.djCount', { count: filteredDjs.length })}
        </Text>
        <Button
          className="s-exclusive-itinerary__sort-btn"
          hoverClass="s-exclusive-itinerary__sort-btn--pressed"
          onTap={onOpenSortSheet}
        >
          <Text>{sortModeLabel}</Text>
          <ChevronDown size={14} color="var(--primary)" />
        </Button>
      </View>

      <View className="s-exclusive-itinerary__grid">
        {filteredDjs.map((dj) => {
          const selectionIndex = selectedIds.indexOf(dj.id);
          const isSelected = selectionIndex >= 0;
          const accent = isSelected && selectionIndex % 2 === 1 ? 'purple' : 'pink';
          const showPurple = isSelected && accent === 'purple';
          const showPink = isSelected && accent === 'pink';

          return (
            <View
              key={dj.id}
              id={itineraryDjCardDomId(dj.id)}
              className={[
                's-exclusive-itinerary__card',
                showPink ? 's-exclusive-itinerary__card--pink' : '',
                showPurple ? 's-exclusive-itinerary__card--purple' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              hoverClass="s-exclusive-itinerary__card--pressed"
              hoverStartTime={0}
              hoverStayTime={50}
              aria-label={`${dj.name}，${dj.genreLabel}`}
              onClick={() => onToggleDj(dj.id)}
            >
              {isSelected ? (
                <View
                  className={[
                    's-exclusive-itinerary__check',
                    's-exclusive-itinerary__check--corner',
                    showPurple
                      ? 's-exclusive-itinerary__check--purple'
                      : 's-exclusive-itinerary__check--pink',
                  ].join(' ')}
                  aria-hidden
                >
                  <Check size={13} color="#fff" strokeWidth={3} />
                </View>
              ) : null}
              <Text className="s-exclusive-itinerary__name">{dj.name}</Text>
              <Text
                className="s-exclusive-itinerary__genre"
                style={{
                  color: isSelected
                    ? showPurple
                      ? '#7b61ff'
                      : 'var(--primary)'
                    : dj.genreColor,
                }}
              >
                {dj.genreLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </>
  );
};

export default ExclusiveItineraryDjGrid;
