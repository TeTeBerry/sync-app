import type { ConfirmDialogOptions } from '../hooks/useConfirmDialog';

export const BUDDY_GUIDE_AFTER_JOIN_TITLE = '报名成功';

export const BUDDY_GUIDE_AFTER_JOIN_MESSAGE =
  '你可以在本场活动详情查看结伴帖，或发布自己的组队信息寻找同好。现在去看看吗？';

export const BUDDY_GUIDE_AFTER_JOIN_CONFIRM = '去看结伴帖';

export const BUDDY_GUIDE_AFTER_JOIN_CANCEL = '稍后再说';

export type BuddyGuideConfirm = (options: ConfirmDialogOptions) => Promise<boolean>;

/** Prompt user to open activity buddy feed after first-time registration. */
export async function promptBuddyGuideAfterJoin(
  confirm: BuddyGuideConfirm,
): Promise<boolean> {
  return confirm({
    title: BUDDY_GUIDE_AFTER_JOIN_TITLE,
    message: BUDDY_GUIDE_AFTER_JOIN_MESSAGE,
    confirmText: BUDDY_GUIDE_AFTER_JOIN_CONFIRM,
    cancelText: BUDDY_GUIDE_AFTER_JOIN_CANCEL,
  });
}
