import "./MetaRow.scss";
import React from "react";
import { Text, View } from "@tarojs/components";

export type MetaRowProps = {
  icon: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export const MetaRow: React.FC<MetaRowProps> = ({ icon, className, children }) => {
  const rootClass = ["s-meta-row", className].filter(Boolean).join(" ");

  return (
    <View className={rootClass}>
      <View className="s-meta-row__icon">{icon}</View>
      <Text className="s-meta-row__text">{children}</Text>
    </View>
  );
};
