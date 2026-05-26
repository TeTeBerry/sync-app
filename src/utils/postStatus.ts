/** Backend/API post status labels (Chinese from post.mapper). */
export type BackendPostStatusLabel = "招募中" | "已成团";

/** Activity page post card shows only recruiting vs full. */
export type EventPostCardStatus = "recruiting" | "full";

export function toEventPostCardStatus(status: BackendPostStatusLabel): EventPostCardStatus {
  return status === "已成团" ? "full" : "recruiting";
}

export function eventPostStatusClass(status: EventPostCardStatus): string {
  return status === "full"
    ? "s-event-post__status s-event-post__status--full"
    : "s-event-post__status";
}

export function eventPostStatusI18nKey(status: EventPostCardStatus): "eventDetail.postStatus.recruiting" | "common.full" {
  return status === "full" ? "common.full" : "eventDetail.postStatus.recruiting";
}
