import "./ContentTypeBadge.scss";
import React from "react";
import { Text, View } from "@tarojs/components";

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

/** API may return English keys or Chinese labels. */
const LABEL_TO_TYPE: Record<string, string> = {
  组队: "team",
  组队队友: "team",
  住宿: "accommodation",
  住宿同行: "accommodation",
  拼房: "accommodation",
  拼车: "carpool",
  拼车同行: "carpool",
  其他: "other",
};

function resolveTypeKey(type: string): string {
  if (TYPE_STYLES[type]) return type;
  return LABEL_TO_TYPE[type] ?? type;
}

export const ContentTypeBadge: React.FC<{
  types?: string[];
}> = ({ types }) => {
  if (!types?.length) return null;

  return (
    <View className="s-content-badges">
      {types.map((type) => {
        const key = resolveTypeKey(type);
        return (
          <View
            key={type}
            className={`s-content-badge ${TYPE_STYLES[key] ?? ""}`}>
            <Text className="s-content-badge__label">
              {TYPE_LABELS[key] ?? type}
            </Text>
          </View>
        );
      })}
    </View>
  );
};
