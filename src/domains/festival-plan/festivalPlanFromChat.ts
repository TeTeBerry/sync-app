import type { ChatUiMessage } from '@/types/aiChat';

export function findTravelGuideInChatMessages(
  messages: ChatUiMessage[],
): { guideId: string } | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const payload = messages[index]?.travelGuide;
    if (!payload?.plan || !payload.form) continue;
    const guideId = payload.guideId?.trim() || messages[index]?.id;
    if (!guideId) continue;
    return { guideId };
  }
  return null;
}

export function findBuddyPostInChatMessages(
  messages: ChatUiMessage[],
): { postId: string } | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const post = messages[index]?.createdPost;
    const postId = post?.postId?.trim();
    if (!postId) continue;
    return { postId };
  }
  return null;
}
