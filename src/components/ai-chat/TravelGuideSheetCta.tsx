import './TravelGuideSheetCta.scss';
import { Text, View } from '@tarojs/components';
import { getTravelGuideSheetActionLabel } from '../../utils/travelGuidePromptMessage';
import { useT } from '@/hooks/useI18n';

export type TravelGuideSheetCtaProps = {
  onPress: () => void;
  disabled?: boolean;
  onOpenSheet?: () => void;
};

export function TravelGuideSheetCta({ onPress }: TravelGuideSheetCtaProps) {
  useT();
  const label = getTravelGuideSheetActionLabel();

  return (
    <View
      className="s-travel-guide-sheet-cta"
      hoverClass="s-travel-guide-sheet-cta--pressed"
      onClick={onPress}
      role="button"
      aria-label={label}
    >
      <View className="s-travel-guide-sheet-cta__inner">
        <Text className="s-travel-guide-sheet-cta__sparkle" aria-hidden>
          ✨
        </Text>
        <Text className="s-travel-guide-sheet-cta__label">{label}</Text>
      </View>
    </View>
  );
}
