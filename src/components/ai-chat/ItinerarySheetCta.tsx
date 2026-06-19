import './ItinerarySheetCta.scss';
import { Text, View } from '@tarojs/components';
import { getItinerarySheetActionLabel } from '../../utils/itineraryPromptMessage';
import { useT } from '@/hooks/useI18n';

export type ItinerarySheetCtaProps = {
  onPress: () => void;
};

export function ItinerarySheetCta({ onPress }: ItinerarySheetCtaProps) {
  useT();
  const label = getItinerarySheetActionLabel();

  return (
    <View
      className="s-itinerary-sheet-cta"
      hoverClass="s-itinerary-sheet-cta--pressed"
      onClick={onPress}
      role="button"
      aria-label={label}
    >
      <View className="s-itinerary-sheet-cta__inner">
        <Text className="s-itinerary-sheet-cta__sparkle" aria-hidden>
          ✨
        </Text>
        <Text className="s-itinerary-sheet-cta__label">{label}</Text>
      </View>
    </View>
  );
}
