import './SheetActionChip.scss';
import { cn } from '../ui';
import { Text, View } from '@tarojs/components';

export type SheetActionChipVariant =
  | 'travel_guide'
  | 'itinerary'
  | 'buddy_post'
  | 'personality';

export type SheetActionChipProps = {
  label: string;
  variant: SheetActionChipVariant;
  onPress: () => void;
  disabled?: boolean;
};

export function SheetActionChip({
  label,
  variant,
  onPress,
  disabled = false,
}: SheetActionChipProps) {
  return (
    <View
      className={cn(
        's-sheet-action-chip',
        `s-sheet-action-chip--${variant}`,
        disabled && 's-sheet-action-chip--disabled',
      )}
      hoverClass={disabled ? '' : 's-sheet-action-chip--pressed'}
      aria-disabled={disabled}
      aria-label={label}
      role="button"
      onClick={() => {
        if (disabled) return;
        onPress();
      }}
    >
      <Text className="s-sheet-action-chip__label">{label}</Text>
      <Text className="s-sheet-action-chip__arrow" aria-hidden>
        →
      </Text>
    </View>
  );
}
