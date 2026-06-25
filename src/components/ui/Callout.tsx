import './Callout.scss';
import type { FC, ReactNode } from 'react';
import { Text, View } from '@tarojs/components';
import { cn } from './cn';

export type CalloutVariant = 'info' | 'warning' | 'stale' | 'success';

export type CalloutProps = {
  variant?: CalloutVariant;
  role?: 'status' | 'alert';
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const Callout: FC<CalloutProps> = ({
  variant = 'info',
  role = 'status',
  title,
  children,
  action,
  className,
}) => {
  return (
    <View className={cn('s-callout', `s-callout--${variant}`, className)} role={role}>
      {title ? <Text className="s-callout__title">{title}</Text> : null}
      {children ? <View className="s-callout__body">{children}</View> : null}
      {action ? <View className="s-callout__action">{action}</View> : null}
    </View>
  );
};
