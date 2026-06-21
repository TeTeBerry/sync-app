import type { ChatUiMessage } from '../../types/aiChat';

/** 欢迎语、快捷集、攻略图等富内容时保持滚动位置 */
export function shouldSuppressAutoScrollForMessage(
  msg: ChatUiMessage | undefined,
): boolean {
  if (!msg) return false;
  if (msg.isWelcome) return true;
  if (msg.recommendedActivity) return true;
  if (msg.createdPost) return true;
  if (msg.matchedPosts?.length) return true;
  if (msg.travelGuide?.plan) return true;
  return false;
}
