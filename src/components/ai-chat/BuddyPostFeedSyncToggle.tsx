import { Button, cn } from '../ui';
import { View } from '@tarojs/components';

export function BuddyPostFeedSyncToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Button
      className={cn(
        's-ai-guide-plan-sheet__toggle',
        checked && 's-ai-guide-plan-sheet__toggle--on',
      )}
      role="switch"
      aria-checked={checked}
      aria-label="同步到留言板"
      hoverClass="s-ai-guide-plan-sheet__toggle--pressed"
      onClick={() => onChange(!checked)}
    >
      <View className="s-ai-guide-plan-sheet__toggle-knob" aria-hidden />
    </Button>
  );
}
