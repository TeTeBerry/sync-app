import { MapPin } from '../../components/icons';
import { Button } from '../ui';
import { TRAVEL_GUIDE_SHEET_ACTION_LABEL } from '../../utils/travelGuidePromptMessage';
import { Text, View } from '@tarojs/components';
import './TravelGuideSheetCta.scss';

export function TravelGuideSheetCta({
  disabled,
  onOpenSheet,
}: {
  disabled?: boolean;
  onOpenSheet: () => void;
}) {
  return (
    <Button
      className="s-travel-guide-sheet-cta"
      disabled={disabled}
      hoverClass="s-travel-guide-sheet-cta--pressed"
      aria-label={TRAVEL_GUIDE_SHEET_ACTION_LABEL}
      onClick={onOpenSheet}
    >
      <MapPin size={18} color="#fff" />
      <View className="s-travel-guide-sheet-cta__text">
        <Text className="s-travel-guide-sheet-cta__title">
          {TRAVEL_GUIDE_SHEET_ACTION_LABEL}
        </Text>
        <Text className="s-travel-guide-sheet-cta__sub">
          填写出发地、人数、预算与住宿晚数
        </Text>
      </View>
    </Button>
  );
}
