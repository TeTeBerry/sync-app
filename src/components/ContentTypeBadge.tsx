import "./ContentTypeBadge.scss";
import React from "react";
import { Text, View } from '@tarojs/components';

const TYPE_LABELS: Record<string, string> = {
  team: "组队",
  accommodation: "住宿",
  carpool: "拼车",
  other: "其他",
};

const TYPE_STYLES: Record<string, string> = {
  team: "s-content-badge--team",
  accommodation: "s-content-badge--accommodation",
  carpool: "s-content-badge--carpool",
  other: "s-content-badge--other",
};

export const ContentTypeBadge: React.FC<{
  types?: string[];
}> = ({ types }) => {
  if (!types?.length) return null;

  return (
    <View className="s-content-badges">
      {types.map((type) => (
        <Text
          key={type}
          className={`s-content-badge ${TYPE_STYLES[type] ?? ""}`}
        >
          {TYPE_LABELS[type] ?? type}
        </Text>
      ))}
    </View>
  );
};
