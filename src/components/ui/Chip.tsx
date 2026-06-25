import './Chip.scss';
import type { FC } from 'react';
import { Text, View } from '@tarojs/components';
import { cn } from './cn';

export type ChipSize = 'md' | 'sm';

export type ChipProps = {
  label: string;
  active?: boolean;
  size?: ChipSize;
  className?: string;
  onClick: () => void;
};

export const Chip: FC<ChipProps> = ({
  label,
  active = false,
  size = 'md',
  className,
  onClick,
}) => {
  return (
    <View
      className={cn(
        's-chip',
        size === 'sm' && 's-chip--sm',
        active && 's-chip--active',
        className,
      )}
      onClick={onClick}
    >
      <Text className={cn('s-chip__label', active && 's-chip__label--active')}>
        {label}
      </Text>
    </View>
  );
};
