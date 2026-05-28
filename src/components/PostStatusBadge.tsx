import React from "react";
import { Tag } from "@nutui/nutui-react-taro";
import {
  type BackendPostStatusLabel,
  eventPostStatusText,
  isHiddenPostStatus,
  isRecruitingPostStatus,
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

  const isFull = status === "已组队";

  return (
    <Tag
      className="s-post-status-badge"
      round
      color={isFull ? "var(--muted-foreground)" : "#ff3366"}
      background={isFull ? "rgba(255, 255, 255, 0.1)" : "rgba(74, 14, 28, 0.85)"}>
      {label}
    </Tag>
  );
};
