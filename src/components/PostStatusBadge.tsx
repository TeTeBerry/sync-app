import "./PostStatusBadge.scss";
import React from "react";
import { Text } from "@tarojs/components";
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
};

export const PostStatusBadge: React.FC<PostStatusBadgeProps> = ({ status, variant }) => {
  if (isRecruitingPostStatus(status) || isHiddenPostStatus(status)) {
    return null;
  }

  const cardStatus = toEventPostCardStatus(status);
  const label =
    variant === "home" ? status : eventPostStatusText(cardStatus);

  return <Text className={postStatusBadgeClass(cardStatus)}>{label}</Text>;
};
