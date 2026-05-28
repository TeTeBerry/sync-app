import React from "react";
import { Text } from "@tarojs/components";
import {
  type ActivityStatus,
  activityStatusBadgeClass,
  activityStatusText,
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
  const status = statusProp ?? getActivityStatusFromActivity(date, title);

  if (!alwaysShow && !shouldShowActivityStatusBadge(status)) {
    return null;
  }

  const badgeClass = [activityStatusBadgeClass(status), className].filter(Boolean).join(" ");

  return <Text className={badgeClass}>{activityStatusText(status)}</Text>;
};
