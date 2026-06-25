import './Chip.scss';
import type { FC, ReactNode } from 'react';
import { View } from '@tarojs/components';
import { cn } from './cn';

export type ChipRowProps = {
  children: ReactNode;
  className?: string;
};

export const ChipRow: FC<ChipRowProps> = ({ children, className }) => {
  return <View className={cn('s-chip-row', className)}>{children}</View>;
};
