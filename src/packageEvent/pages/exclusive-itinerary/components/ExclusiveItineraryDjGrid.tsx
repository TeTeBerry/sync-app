import React from 'react';
import { Check, ChevronDown, Search, X } from '../../../../components/icons';
import { Button, Input } from '../../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';
import type { ExclusiveItineraryFilterChip } from '../exclusiveItineraryFilters';
import type { ExclusiveItineraryDj } from '../types';
import { itineraryDjCardDomId } from '@/domains/performance-itinerary/utils/resolveItineraryDjSelection';

export type ExclusiveItineraryDjGridProps = {
  selectedCount: number;
  stageFilter: string;
  genreFilter: string;
  styleSearchQuery: string;
  stageOptions: ExclusiveItineraryFilterChip[];
  genreOptions: ExclusiveItineraryFilterChip[];
  sortMode: string;
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
  return (
    <>
      <View className="s-exclusive-itinerary__step">
        <Text className="s-exclusive-itinerary__step-title">
          {t('personality.step1Title')}
        </Text>
        <Text className="s-exclusive-itinerary__step-badge">
          {t('personality.step1Badge', { count: selectedCount })}
        </Text>
      </View>

      <View className="s-exclusive-itinerary__filter-block">
        <Text className="s-exclusive-itinerary__filter-label">
          {t('personality.stageFilter')}
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
                  onClick={() => onStageFilterChange(stage.id)}
                >
                  <Text className="s-exclusive-itinerary__chip-text">
                    {stage.label}
                  </Text>
                  {active ? <Check size={14} color="#ffffff" aria-hidden /> : null}
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className="s-exclusive-itinerary__filter-block">
        <Text className="s-exclusive-itinerary__filter-label">
          {t('personality.genreFilter')}
        </Text>
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
                  onClick={() => onGenreFilterChange(genre.id)}
                >
                  <Text className="s-exclusive-itinerary__chip-text">
                    {genre.label}
                  </Text>
                  {active ? <Check size={14} color="#ffffff" aria-hidden /> : null}
                </Button>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View className="s-exclusive-itinerary__search-row">
        <View className="s-exclusive-itinerary__search-wrap">
          <Search size={16} color="#8e8e93" aria-hidden />
          <Input
            className="s-exclusive-itinerary__search-input"
            type="text"
            value={styleSearchQuery}
            placeholder={t('personality.searchPlaceholder')}
            confirmType="search"
            onInput={(e) => onStyleSearchQueryChange(e.detail?.value ?? '')}
          />
          {styleSearchQuery ? (
            <Button
              className="s-exclusive-itinerary__search-clear"
              onClick={() => onStyleSearchQueryChange('')}
            >
              <X size={14} color="#8e8e93" />
            </Button>
          ) : null}
        </View>
        <Button className="s-exclusive-itinerary__sort-btn" onClick={onOpenSortSheet}>
          <Text className="s-exclusive-itinerary__sort-btn-text">{sortMode}</Text>
          <ChevronDown size={14} color="#8e8e93" />
        </Button>
      </View>

      <View className="s-exclusive-itinerary__dj-grid">
        {filteredDjs.map((dj) => {
          const selected = selectedIds.includes(dj.id);
          const domId = itineraryDjCardDomId(dj.id);
          return (
            <Button
              key={dj.id}
              id={domId}
              className={[
                's-exclusive-itinerary__dj-card',
                selected ? 's-exclusive-itinerary__dj-card--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              hoverClass="s-exclusive-itinerary__dj-card--pressed"
              onClick={() => onToggleDj(dj.id)}
            >
              <View className="s-exclusive-itinerary__dj-card-check">
                {selected ? <Check size={20} color="#64d2ff" /> : null}
              </View>
              <Text className="s-exclusive-itinerary__dj-card-name">{dj.name}</Text>
              <Text className="s-exclusive-itinerary__dj-card-genre">{dj.genre}</Text>
            </Button>
          );
        })}
      </View>
    </>
  );
};

export default ExclusiveItineraryDjGrid;
