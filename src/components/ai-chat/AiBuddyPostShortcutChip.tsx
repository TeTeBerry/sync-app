import './AiBuddyPostShortcutChip.scss';
import { ChevronRight, Users } from '../../components/icons';
import { Button, cn } from '../ui';
import { Text } from '@tarojs/components';

export type AiBuddyPostShortcutChipProps = {
  className?: string;
  disabled?: boolean;
  onClick: () => void;
};

export function AiBuddyPostShortcutChip({
  className,
  disabled,
  onClick,
}: AiBuddyPostShortcutChipProps) {
  return (
    <Button
      className={cn('s-ai-buddy-post-shortcut-chip', className)}
      disabled={disabled}
      hoverClass="s-ai-buddy-post-shortcut-chip--pressed"
      onClick={onClick}
    >
      <Users size={14} className="s-ai-buddy-post-shortcut-chip__icon" aria-hidden />
      <Text className="s-ai-buddy-post-shortcut-chip__label">组队发帖</Text>
      <ChevronRight
        size={14}
        className="s-ai-buddy-post-shortcut-chip__chevron"
        aria-hidden
      />
    </Button>
  );
}
