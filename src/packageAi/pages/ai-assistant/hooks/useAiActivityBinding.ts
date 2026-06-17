import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import type { BackendActivity } from '../../../../types/backend';

export function useAiActivityBinding(options: {
  applyActivityBinding: (activity: {
    legacyId: number;
    name?: string;
    activity?: BackendActivity;
  }) => void;
  scheduleScrollToBottom: () => void;
}) {
  const { applyActivityBinding, scheduleScrollToBottom } = options;
  const [activityPickerOpen, setActivityPickerOpen] = useState(false);

  const openActivityPicker = useCallback(() => {
    setActivityPickerOpen(true);
  }, []);

  const closeActivityPicker = useCallback(() => {
    setActivityPickerOpen(false);
  }, []);

  const bindSelectedActivity = useCallback(
    (activity: BackendActivity) => {
      if (activity.legacyId == null || Number.isNaN(activity.legacyId)) {
        return;
      }

      const activityName = activity.name?.trim() || '本场活动';
      applyActivityBinding({
        legacyId: activity.legacyId,
        name: activityName,
        activity,
      });
      void Taro.showToast({
        title: `已绑定「${activityName}」`,
        icon: 'none',
      });
      scheduleScrollToBottom();
    },
    [applyActivityBinding, scheduleScrollToBottom],
  );

  const handleActivityPicked = useCallback(
    (activity: BackendActivity) => {
      setActivityPickerOpen(false);
      bindSelectedActivity(activity);
    },
    [bindSelectedActivity],
  );

  return {
    activityPickerOpen,
    openActivityPicker,
    closeActivityPicker,
    bindSelectedActivity,
    handleActivityPicked,
  };
}
