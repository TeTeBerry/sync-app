import { getPersonalityTestSheetActionLabel } from '../../utils/personalityTestPromptMessage';
import { SheetActionChip } from './SheetActionChip';

export function PersonalityTestSheetCta({
  disabled,
  onOpenSheet,
}: {
  disabled?: boolean;
  onOpenSheet: () => void;
}) {
  return (
    <SheetActionChip
      label={getPersonalityTestSheetActionLabel()}
      variant="personality"
      disabled={disabled}
      onPress={onOpenSheet}
    />
  );
}
