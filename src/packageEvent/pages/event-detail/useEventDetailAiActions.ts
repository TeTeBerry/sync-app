import Taro from '@tarojs/taro';
import { useCallback, useState } from 'react';
import { goAiAssistant, goExclusiveItinerary } from '../../../utils/route';
import { isAiShortcutTag, recordAiShortcutTagUse } from '../../../utils/aiShortcutTags';

export function useEventDetailAiActions(eventId: number) {
  const [prompt, setPrompt] = useState('');

  const bumpShortcutTagUsage = useCallback((tag: string) => {
    recordAiShortcutTagUse(tag);
  }, []);

  const handleOpenExclusiveItinerary = useCallback(() => {
    if (!Number.isFinite(eventId) || eventId <= 0) {
      void Taro.showToast({ title: '活动信息无效', icon: 'none' });
      return;
    }
    goExclusiveItinerary(eventId);
  }, [eventId]);

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
      if (tag === 'AI攻略') {
        goAiAssistant({ activityLegacyId: eventId, openAiGuideSheet: true });
        return;
      }
      bumpShortcutTagUsage(tag);
      goAiAssistant({ initialMessage: tag, activityLegacyId: eventId });
    },
    [bumpShortcutTagUsage, eventId],
  );

  const handleOpenAiGuide = useCallback(() => {
    goAiAssistant({ activityLegacyId: eventId, openAiGuideSheet: true });
  }, [eventId]);

  return {
    prompt,
    setPrompt,
    openAi,
    handleShortcutTag,
    handleOpenAiGuide,
    handleOpenExclusiveItinerary,
  };
}
