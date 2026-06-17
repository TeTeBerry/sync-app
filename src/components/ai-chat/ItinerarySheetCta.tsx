import { Music2 } from '../../components/icons';
import { Button } from '../ui';
import { ITINERARY_SHEET_ACTION_LABEL } from '../../utils/itineraryPromptMessage';
import { Text, View } from '@tarojs/components';
import './ItinerarySheetCta.scss';

export function ItinerarySheetCta({
  disabled,
  onOpenSheet,
}: {
  disabled?: boolean;
  onOpenSheet: () => void;
}) {
  return (
    <Button
      className="s-itinerary-sheet-cta"
      disabled={disabled}
      hoverClass="s-itinerary-sheet-cta--pressed"
      aria-label={ITINERARY_SHEET_ACTION_LABEL}
      onClick={onOpenSheet}
    >
      <Music2 size={18} color="#fff" />
      <View className="s-itinerary-sheet-cta__text">
        <Text className="s-itinerary-sheet-cta__title">
          {ITINERARY_SHEET_ACTION_LABEL}
        </Text>
        <Text className="s-itinerary-sheet-cta__sub">选择想看的 DJ，生成专属行程</Text>
      </View>
    </Button>
  );
}
