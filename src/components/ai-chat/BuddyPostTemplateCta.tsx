import { getBuddyPostSheetActionLabel } from '../../utils/buddyPostPromptMessage';
import { SheetActionChip } from './SheetActionChip';

export type BuddyPostTemplateCtaProps = {
  onPress: () => void;
  disabled?: boolean;
  onOpenSheet?: () => void;
};

export function BuddyPostTemplateCta({ onPress, disabled }: BuddyPostTemplateCtaProps) {
  return (
    <SheetActionChip
      label={getBuddyPostSheetActionLabel()}
      variant="buddy_post"
      disabled={disabled}
      onPress={onPress}
    />
  );
}
