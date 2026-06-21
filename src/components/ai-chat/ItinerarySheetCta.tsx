import { getItinerarySheetActionLabel } from '../../utils/itineraryPromptMessage';
import { SheetActionChip } from './SheetActionChip';

export type ItinerarySheetCtaProps = {
  onPress: () => void;
  disabled?: boolean;
  onOpenSheet?: () => void;
};

export function ItinerarySheetCta({ onPress, disabled }: ItinerarySheetCtaProps) {
  return (
    <SheetActionChip
      label={getItinerarySheetActionLabel()}
      variant="itinerary"
      disabled={disabled}
      onPress={onPress}
    />
  );
}
