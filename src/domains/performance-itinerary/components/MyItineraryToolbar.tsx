import React from 'react';
import { Bookmark, List, Map, RotateCcw } from '@/components/icons';
import { Button } from '@/components/ui';
import { Text, View } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type MyItineraryViewMode = 'timeline' | 'map';

export type MyItinerarySegmentProps = {
  viewMode: MyItineraryViewMode;
  onViewModeChange: (mode: MyItineraryViewMode) => void;
};

export const MyItinerarySegment: React.FC<MyItinerarySegmentProps> = ({
  viewMode,
  onViewModeChange,
}) => (
  <View className="s-my-itinerary__segment">
    <Button
      className={[
        's-my-itinerary__segment-btn',
        viewMode === 'timeline' ? 's-my-itinerary__segment-btn--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      hoverClass="s-my-itinerary__segment-btn--pressed"
      onTap={() => onViewModeChange('timeline')}
    >
      <List size={16} color={viewMode === 'timeline' ? '#fff' : '#8e8e93'} />
      <Text>时间轴</Text>
    </Button>
    <Button
      className={[
        's-my-itinerary__segment-btn',
        viewMode === 'map' ? 's-my-itinerary__segment-btn--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      hoverClass="s-my-itinerary__segment-btn--pressed"
      onTap={() => onViewModeChange('map')}
    >
      <Map size={16} color={viewMode === 'map' ? '#fff' : '#8e8e93'} />
      <Text>地图</Text>
    </Button>
  </View>
);

export type MyItineraryFooterProps = {
  onReselect: () => void;
  onSave: () => void;
  saving?: boolean;
};

export const MyItineraryFooter: React.FC<MyItineraryFooterProps> = ({
  onReselect,
  onSave,
  saving = false,
}) => {
  const t = useT();

  return (
    <View className="s-my-itinerary__footer">
      <Button
        className="s-my-itinerary__footer-btn s-my-itinerary__footer-btn--secondary"
        hoverClass={saving ? '' : 's-my-itinerary__footer-btn--pressed'}
        disabled={saving}
        onTap={onReselect}
      >
        <RotateCcw size={16} color="#fff" aria-hidden />
        <Text>重新选择</Text>
      </Button>
      <Button
        className={[
          's-my-itinerary__footer-btn',
          's-my-itinerary__footer-btn--primary',
          saving ? 's-my-itinerary__footer-btn--loading' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        hoverClass={saving ? '' : 's-my-itinerary__footer-btn--pressed'}
        disabled={saving}
        onTap={onSave}
        aria-busy={saving}
      >
        {saving ? (
          <View className="s-my-itinerary__footer-btn-spinner" aria-hidden />
        ) : (
          <Bookmark size={16} color="#fff" aria-hidden />
        )}
        <Text>
          {saving
            ? t('itinerary.generatingWallpaper')
            : t('itinerary.generateWallpaper')}
        </Text>
      </Button>
    </View>
  );
};
