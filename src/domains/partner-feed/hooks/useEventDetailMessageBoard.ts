import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import { useAccountRisk } from '../../../hooks/useAccountRisk';
import type { EventDetailPost } from '../../../types/post';
import { BUDDY_POST_MAX_IMAGES } from '../../../types/buddyPost';
import {
  buildOptimisticMessageBoardPost,
  publishMessageBoardPost,
} from '../../../utils/publishMessageBoardPost';
import { resolveCurrentPostLocation } from '../../../utils/resolveCurrentPostLocation';
import { pickAndCompressChatImages } from '../../../utils/chatImage';
import { getClientUserId } from '../../../utils/session';

export function useEventDetailMessageBoard(
  eventId: number,
  options: {
    activityTitle?: string;
    authorName: string;
    authorAvatar?: string;
    refreshPosts?: (options?: { silent?: boolean }) => Promise<void>;
    prependPost?: (post: EventDetailPost) => void;
    replacePost?: (pendingId: string, post: EventDetailPost) => void;
    removePost?: (postId: string) => void;
    accountRiskEnabled?: boolean;
  },
) {
  const [draft, setDraft] = useState('');
  const [imageRefs, setImageRefs] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const { guardPublish, handlePublishError } = useAccountRisk({
    enabled: options.accountRiskEnabled ?? true,
  });

  const pickImages = useCallback(async () => {
    const remaining = BUDDY_POST_MAX_IMAGES - imageRefs.length;
    if (remaining <= 0) return;
    const picked = await pickAndCompressChatImages(remaining);
    if (!picked.length) return;
    setImageRefs((prev) => [...prev, ...picked].slice(0, BUDDY_POST_MAX_IMAGES));
  }, [imageRefs.length]);

  const removeImage = useCallback((index: number) => {
    setImageRefs((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const publishMessage = useCallback(async (): Promise<boolean> => {
    const body = draft.trim();
    const hasImages = imageRefs.length > 0;
    if (!body && !hasImages) {
      void Taro.showToast({ title: '请输入留言或添加图片', icon: 'none' });
      return false;
    }
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return false;
    }
    if (isPublishing) {
      return false;
    }

    const allowed = await guardPublish();
    if (!allowed) {
      return false;
    }

    const bodyToPublish = body || '分享图片 📸';
    const pendingId = `pending-${Date.now()}`;
    const refsToPublish = [...imageRefs];
    const currentLocation = await resolveCurrentPostLocation();
    setIsPublishing(true);
    options.prependPost?.(
      buildOptimisticMessageBoardPost({
        pendingId,
        body: bodyToPublish,
        authorName: options.authorName,
        authorAvatar: options.authorAvatar,
        userId: getClientUserId(),
        imageRefs: refsToPublish,
        location: currentLocation,
      }),
    );
    setDraft('');
    setImageRefs([]);

    try {
      const post = await publishMessageBoardPost({
        body: bodyToPublish,
        imageRefs: refsToPublish,
        activityLegacyId: eventId,
        activityTitle: options.activityTitle ?? '本场活动',
      });
      options.replacePost?.(pendingId, post);
      void options.refreshPosts?.({ silent: true });
      void Taro.showToast({ title: '留言已发布', icon: 'success' });
      return true;
    } catch (error) {
      options.removePost?.(pendingId);
      if (await handlePublishError(error)) {
        return false;
      }
      const message =
        error instanceof Error && error.message.trim()
          ? error.message.trim()
          : '发布失败，请稍后重试';
      void Taro.showToast({ title: message, icon: 'none' });
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [
    draft,
    eventId,
    guardPublish,
    handlePublishError,
    imageRefs,
    isPublishing,
    options,
  ]);

  return {
    draft,
    setDraft,
    imageRefs,
    pickImages,
    removeImage,
    isPublishing,
    publishMessage,
  };
}
