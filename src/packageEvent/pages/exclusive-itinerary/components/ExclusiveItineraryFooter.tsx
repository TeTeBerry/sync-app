import React from 'react';
import { Sparkles } from '../../../../components/icons';
import { Button } from '../../../../components/ui';
import { Text, View } from '@tarojs/components';

export type ExclusiveItineraryFooterProps = {
  selectedCount: number;
  generating: boolean;
  onGenerate: () => void;
};

const ExclusiveItineraryFooter: React.FC<ExclusiveItineraryFooterProps> = ({
  selectedCount,
  generating,
  onGenerate,
}) => (
  <View className="s-exclusive-itinerary__footer">
    <Button
      className={[
        's-exclusive-itinerary__cta',
        selectedCount === 0 || generating ? 's-exclusive-itinerary__cta--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      hoverClass="s-exclusive-itinerary__cta--pressed"
      onTap={onGenerate}
    >
      <Sparkles size={18} color="#fff" aria-hidden />
      <Text className="s-exclusive-itinerary__cta-label">
        {generating ? '生成中…' : '生成时间表'}
      </Text>
    </Button>
  </View>
);

export default ExclusiveItineraryFooter;
