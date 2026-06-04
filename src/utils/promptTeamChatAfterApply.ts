import Taro from '@tarojs/taro';
import type { ConfirmDialogOptions } from '../hooks/useConfirmDialog';
import { invalidateTeamChatQueries } from '../hooks/useSyncApi';
import { goTempChat } from './route';

export type ApplyTeamChatRef = {
  sessionId: string;
  postId: string;
  applicantUserId: string;
};

export type PromptAfterApplyOptions = {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
  teamChat?: ApplyTeamChatRef;
  /** Shown when user applied via light card (no recruiting post yet). */
  lightApply?: boolean;
  onCompleteBuddyPost?: () => void;
};

/** After a successful post application, offer DM and optional buddy-post completion. */
export async function promptOpenTeamChatAfterApply(
  options: PromptAfterApplyOptions,
): Promise<void> {
  const { confirm, teamChat, lightApply, onCompleteBuddyPost } = options;

  if (lightApply && onCompleteBuddyPost) {
    const completeBuddy = await confirm({
      title: '申请成功',
      message: '已向帖主发送你的简要信息。完善组队帖后更容易被接受，是否现在填写？',
      confirmText: '完善组队帖',
      cancelText: teamChat ? '去私信' : '稍后再说',
    });

    if (completeBuddy) {
      onCompleteBuddyPost();
      return;
    }

    if (teamChat) {
      await invalidateTeamChatQueries();
      goTempChat(teamChat.sessionId);
    }
    return;
  }

  if (!teamChat) {
    void Taro.showToast({ title: '申请成功', icon: 'success' });
    return;
  }

  const openChat = await confirm({
    title: '申请成功',
    message: '已向帖主发送留言，是否现在打开私信继续沟通？',
    confirmText: '去私信',
    cancelText: '稍后再说',
  });

  if (!openChat) return;

  await invalidateTeamChatQueries();
  goTempChat(teamChat.sessionId);
}
