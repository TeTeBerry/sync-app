import './PostOwnerSlotsStepper.scss';
import { Button } from '../ui';
import { Text } from '@tarojs/components';
import { useT } from '@/hooks/useI18n';

export type PostOwnerSlotStepProps = {
  side: 'decrease' | 'increase';
  disabled?: boolean;
  onPress: () => void;
};

export function PostOwnerSlotStep({ side, disabled, onPress }: PostOwnerSlotStepProps) {
  const t = useT();
  const isDecrease = side === 'decrease';

  return (
    <Button
      className="s-post-owner-slots-step"
      disabled={disabled}
      aria-label={t(
        isDecrease ? 'eventDetail.decreaseSlots' : 'eventDetail.increaseSlots',
      )}
      onClick={(event) => {
        event.stopPropagation();
        onPress();
      }}
    >
      <Text className="s-post-owner-slots-step__glyph" aria-hidden>
        {isDecrease ? '−' : '+'}
      </Text>
    </Button>
  );
}
