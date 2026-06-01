import React from 'react';
import { Check, ChevronDown } from 'lucide-react-taro';
import { Button } from '../../../../components/ui';
import { Image, ScrollView, Text, View } from '@tarojs/components';
import { picsumUrl } from '../../../../utils/imageUrl';
import {
  EXCLUSIVE_ITINERARY_GENRES,
  EXCLUSIVE_ITINERARY_STAGES,
  type ExclusiveItineraryDj,
} from '../exclusiveItineraryMock';

export type ExclusiveItineraryDjGridProps = {
  selectedCount: number;
  stageFilter: string;
  genreFilter: string;
  sortMode: string;
  filteredDjs: ExclusiveItineraryDj[];
  selectedIds: string[];
  onStageFilterChange: (stageId: string) => void;
  onGenreFilterChange: (genreId: string) => void;
  onOpenSortSheet: () => void;
  onToggleDj: (id: string) => void;
};

const ExclusiveItineraryDjGrid: React.FC<ExclusiveItineraryDjGridProps> = ({
  selectedCount,
  stageFilter,
  genreFilter,
  sortMode,
  filteredDjs,
  selectedIds,
  onStageFilterChange,
  onGenreFilterChange,
  onOpenSortSheet,
  onToggleDj,
}) => (
  <>
    <View className="s-exclusive-itinerary__step">
      <Text className="s-exclusive-itinerary__step-title">第一步：选择你喜爱的 DJ</Text>
      <Text className="s-exclusive-itinerary__step-badge">已选 {selectedCount} 位</Text>
    </View>

    <View className="s-exclusive-itinerary__filter-block">
      <Text className="s-exclusive-itinerary__filter-label">舞台筛选</Text>
      <ScrollView
        scrollX
        enhanced
        showScrollbar={false}
        className="s-exclusive-itinerary__chip-scroll s-scrollbar-none"
      >
        <View className="s-exclusive-itinerary__chip-row">
          {EXCLUSIVE_ITINERARY_STAGES.map((stage) => {
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
              </Button>
            );
          })}
        </View>
      </ScrollView>
    </View>

    <View className="s-exclusive-itinerary__filter-block">
      <Text className="s-exclusive-itinerary__filter-label">音乐风格</Text>
      <ScrollView
        scrollX
        enhanced
        showScrollbar={false}
        className="s-exclusive-itinerary__chip-scroll s-scrollbar-none"
      >
        <View className="s-exclusive-itinerary__chip-row">
          {EXCLUSIVE_ITINERARY_GENRES.map((genre) => {
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
              </Button>
            );
          })}
        </View>
      </ScrollView>
    </View>

    <View className="s-exclusive-itinerary__list-head">
      <Text className="s-exclusive-itinerary__list-count">
        共 {filteredDjs.length} 位 DJ
      </Text>
      <Button
        className="s-exclusive-itinerary__sort-btn"
        hoverClass="s-exclusive-itinerary__sort-btn--pressed"
        onTap={onOpenSortSheet}
      >
        <Text>{sortMode}</Text>
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
          <Button
            key={dj.id}
            className={[
              's-exclusive-itinerary__card',
              showPink ? 's-exclusive-itinerary__card--pink' : '',
              showPurple ? 's-exclusive-itinerary__card--purple' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            hoverClass="s-exclusive-itinerary__card--pressed"
            aria-label={`${dj.name}，${dj.genreLabel}`}
            onTap={() => onToggleDj(dj.id)}
          >
            <View className="s-exclusive-itinerary__avatar-wrap">
              <Image
                className="s-exclusive-itinerary__avatar"
                src={picsumUrl(dj.avatarSeed, 144, 144)}
                mode="aspectFill"
              />
              {isSelected ? (
                <View
                  className={[
                    's-exclusive-itinerary__check',
                    showPurple
                      ? 's-exclusive-itinerary__check--purple'
                      : 's-exclusive-itinerary__check--pink',
                  ].join(' ')}
                  aria-hidden
                >
                  <Check size={13} color="#fff" strokeWidth={3} />
                </View>
              ) : null}
            </View>
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
          </Button>
        );
      })}
    </View>
  </>
);

export default ExclusiveItineraryDjGrid;
