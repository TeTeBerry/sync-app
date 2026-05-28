import React from "react";
import { Text } from '@tarojs/components';

export type MetaRowProps = {
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export const MetaRow: React.FC<MetaRowProps> = ({ icon, className, children }) => (
  <Text className={className}>
    {icon}
    {children}
  </Text>
);
