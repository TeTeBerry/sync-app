/** Backend/API post status labels (Chinese from post.mapper). */
export type BackendPostStatusLabel = "招募中" | "已组队" | "已隐藏";

export function isRecruitingPostStatus(status: BackendPostStatusLabel): boolean {
  return status === "招募中";
}

export function isHiddenPostStatus(status: BackendPostStatusLabel): boolean {
  return status === "已隐藏";
}

/** Activity page post card shows only recruiting vs full. */
export type EventPostCardStatus = "recruiting" | "full";

export function toEventPostCardStatus(
  status: BackendPostStatusLabel,
): EventPostCardStatus {
  return status === "已组队" ? "full" : "recruiting";
}

export function postStatusBadgeClass(status: EventPostCardStatus): string {
  return status === "full"
    ? "s-post-status-badge s-post-status-badge--full"
    : "s-post-status-badge s-post-status-badge--recruiting";
}

export function eventPostStatusI18nKey(
  status: EventPostCardStatus,
): "eventDetail.postStatus.recruiting" | "common.full" {
  return status === "full"
    ? "common.full"
    : "eventDetail.postStatus.recruiting";
}

export function eventPostStatusText(status: EventPostCardStatus): string {
  return status === "full" ? "已组队" : "招募中";
}
