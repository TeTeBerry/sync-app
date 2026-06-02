import './AiGuideShortcutChip.scss';
import { ChevronRight, Map } from '../../components/icons';
import { Button, cn } from '../ui';
import { Text } from '@tarojs/components';

export type AiGuideShortcutChipProps = {
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  onTouchStart?: () => void;
};

export function AiGuideShortcutChip({
  className,
  disabled,
  onClick,
  onTouchStart,
}: AiGuideShortcutChipProps) {
  return (
    <Button
      className={cn('s-ai-guide-shortcut-chip', className)}
      disabled={disabled}
      hoverClass="s-ai-guide-shortcut-chip--pressed"
      onTouchStart={onTouchStart}
      onClick={onClick}
    >
      <Map size={14} className="s-ai-guide-shortcut-chip__icon" aria-hidden />
      <Text className="s-ai-guide-shortcut-chip__label">AI攻略</Text>
      <ChevronRight
        size={14}
        className="s-ai-guide-shortcut-chip__chevron"
        aria-hidden
      />
    </Button>
  );
}
