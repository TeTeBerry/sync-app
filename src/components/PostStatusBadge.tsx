import React from "react";
import { Text, View } from "@tarojs/components";
import "./PostStatusBadge.scss";
import {
  type BackendPostStatusLabel,
  eventPostStatusText,
  isHiddenPostStatus,
  isRecruitingPostStatus,
  postStatusBadgeClass,
  toEventPostCardStatus,
} from "../utils/postStatus";

export type PostStatusBadgeProps = {
  status: BackendPostStatusLabel;
  variant: "home" | "event";
  /** Author's own post: show recruiting / hidden status in the badge. */
  isOwn?: boolean;
};

export const PostStatusBadge: React.FC<PostStatusBadgeProps> = ({
  status,
  variant,
  isOwn = false,
}) => {
  if (!isOwn && (isRecruitingPostStatus(status) || isHiddenPostStatus(status))) {
    return null;
  }

  const label =
    variant === "home" || isHiddenPostStatus(status)
      ? status
      : eventPostStatusText(toEventPostCardStatus(status));

  const cardStatus = toEventPostCardStatus(status);

  return (
    <View className={postStatusBadgeClass(cardStatus)}>
      <Text className="s-post-status-badge__text">{label}</Text>
    </View>
  );
};
