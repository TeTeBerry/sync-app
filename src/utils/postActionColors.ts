/** Muted icon/text for post action row (like, comment, share). */
export const POST_ACTION_ICON_COLOR = "#8e8e93";

/** Comment action when expanded / active. */
export const POST_ACTION_ACTIVE_COLOR = "#64d2ff";

/** Like action when liked. */
export const POST_ACTION_LIKED_COLOR = "#ff0066";

export function postActionIconColor(options: { liked?: boolean; active?: boolean }): string {
  if (options.liked) return POST_ACTION_LIKED_COLOR;
  if (options.active) return POST_ACTION_ACTIVE_COLOR;
  return POST_ACTION_ICON_COLOR;
}
