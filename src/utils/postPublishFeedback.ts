import Taro from '@tarojs/taro';
import type { EventDetailPost } from '../types/backend';

export function assertPostPublishedVisible(post: EventDetailPost): void {
  if (post.status !== 'hidden') {
    return;
  }
  const message = post.moderationReason?.trim() || '内容未通过审核，未公开展示';
  void Taro.showToast({ title: message, icon: 'none' });
  throw new Error(message);
}
