import React from "react";
import { useTranslation } from "react-i18next";
import {
  type ActivityStatus,
  activityStatusBadgeClass,
  activityStatusI18nKey,
  getActivityStatusFromActivity,
  shouldShowActivityStatusBadge,
} from "../utils/activityStatus";

export type ActivityStatusBadgeProps = {
  date?: string;
  title?: string;
  status?: ActivityStatus;
  alwaysShow?: boolean;
  className?: string;
};

export const ActivityStatusBadge: React.FC<ActivityStatusBadgeProps> = ({
  date,
  title,
  status: statusProp,
  alwaysShow = false,
  className,
}) => {
  const { t } = useTranslation();
  const status = statusProp ?? getActivityStatusFromActivity(date, title);

  if (!alwaysShow && !shouldShowActivityStatusBadge(status)) {
    return null;
  }

  const badgeClass = [activityStatusBadgeClass(status), className].filter(Boolean).join(" ");

  return <span className={badgeClass}>{t(activityStatusI18nKey(status))}</span>;
};
