import { getTravelGuideSheetActionLabel } from '../../utils/travelGuidePromptMessage';
import { SheetActionChip } from './SheetActionChip';

export type TravelGuideSheetCtaProps = {
  onPress: () => void;
  disabled?: boolean;
  onOpenSheet?: () => void;
};

export function TravelGuideSheetCta({ onPress, disabled }: TravelGuideSheetCtaProps) {
  return (
    <SheetActionChip
      label={getTravelGuideSheetActionLabel()}
      variant="travel_guide"
      disabled={disabled}
      onPress={onPress}
    />
  );
}
