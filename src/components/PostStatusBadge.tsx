import "./PostStatusBadge.scss";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  type BackendPostStatusLabel,
  eventPostStatusI18nKey,
  isRecruitingPostStatus,
  postStatusBadgeClass,
  toEventPostCardStatus,
} from "../utils/postStatus";

export type PostStatusBadgeProps = {
  status: BackendPostStatusLabel;
  variant: "home" | "event";
};

export const PostStatusBadge: React.FC<PostStatusBadgeProps> = ({ status, variant }) => {
  const { t } = useTranslation();

  if (isRecruitingPostStatus(status)) {
    return null;
  }

  const cardStatus = toEventPostCardStatus(status);
  const label =
    variant === "home" ? status : t(eventPostStatusI18nKey(cardStatus));

  return <span className={postStatusBadgeClass(cardStatus)}>{label}</span>;
};
