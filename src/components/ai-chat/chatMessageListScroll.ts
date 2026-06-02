import type { ChatUiMessage } from '../../types/aiChat';

/** 快捷集/匹配流展示卡片、攻略图等富内容时保持滚动位置 */
export function shouldSuppressAutoScrollForMessage(
  msg: ChatUiMessage | undefined,
): boolean {
  if (!msg) return false;
  if (msg.recommendedPosts?.length) return true;
  if (msg.recommendedActivity) return true;
  if (msg.createdPost) return true;
  if (msg.travelGuide?.imagePath?.trim()) return true;
  return false;
}
