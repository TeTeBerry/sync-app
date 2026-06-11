import Taro from '@tarojs/taro';
import { useCallback, useState } from 'react';
import {
  goAiAssistant,
  goExclusiveItinerary,
  goMyItinerary,
} from '../../../utils/route';
import { isAiShortcutTag, recordAiShortcutTagUse } from '../../../utils/aiShortcutTags';

export type UseEventDetailAiActionsOptions = {
  openGuideSheet: () => void;
  openBuddyPostSheet: () => void;
};

export function useEventDetailAiActions(
  eventId: number,
  { openGuideSheet, openBuddyPostSheet }: UseEventDetailAiActionsOptions,
) {
  const [prompt, setPrompt] = useState('');

  const bumpShortcutTagUsage = useCallback((tag: string) => {
    recordAiShortcutTagUse(tag);
  }, []);

  const assertValidEventId = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return false;
    }
    return true;
  }, [eventId]);

  const handleOpenMyItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goMyItinerary(eventId);
  }, [assertValidEventId, eventId]);

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!assertValidEventId()) {
      return;
    }
    goExclusiveItinerary(eventId);
  }, [assertValidEventId, eventId]);

  const openAi = useCallback(
    (message?: string) => {
      const trimmed = message?.trim();
      if (trimmed && isAiShortcutTag(trimmed)) {
        bumpShortcutTagUsage(trimmed);
      }
      setPrompt('');
      goAiAssistant({
        ...(trimmed ? { initialMessage: trimmed } : {}),
        activityLegacyId: Number.isNaN(eventId) ? undefined : eventId,
      });
    },
    [bumpShortcutTagUsage, eventId],
  );

  const handleShortcutTag = useCallback(
    (tag: string) => {
      if (tag === 'AI攻略' || tag === 'AI出行攻略') {
        openGuideSheet();
        return;
      }
      if (tag === '组队发帖') {
        openBuddyPostSheet();
        return;
      }
      bumpShortcutTagUsage(tag);
      goAiAssistant({ initialMessage: tag, activityLegacyId: eventId });
    },
    [bumpShortcutTagUsage, eventId, openBuddyPostSheet, openGuideSheet],
  );

  const handleOpenAiGuide = useCallback(() => {
    openGuideSheet();
  }, [openGuideSheet]);

  const handleOpenBuddyPost = useCallback(() => {
    openBuddyPostSheet();
  }, [openBuddyPostSheet]);

  return {
    prompt,
    setPrompt,
    openAi,
    handleShortcutTag,
    handleOpenAiGuide,
    handleOpenBuddyPost,
    handleOpenMyItinerary,
    handleOpenExclusiveItinerary,
  };
}
