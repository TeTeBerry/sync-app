import { useCallback, useEffect, useState } from 'react';
import Taro from '@tarojs/taro';
import type { BackendActivity } from '../../../../types/backend';
import type { ActivityBindingActions } from '../activityBindingActions';

export function useAiActivityBinding(options: {
  applyActivityBinding: (activity: {
    legacyId: number;
    name?: string;
    activity?: BackendActivity;
  }) => void;
  onActivityBindingActionsChange?: (actions: ActivityBindingActions | null) => void;
}) {
  const { applyActivityBinding, onActivityBindingActionsChange } = options;
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
    },
    [applyActivityBinding],
  );

  const handleActivityPicked = useCallback(
    (activity: BackendActivity) => {
      setActivityPickerOpen(false);
      bindSelectedActivity(activity);
    },
    [bindSelectedActivity],
  );

  useEffect(() => {
    if (!onActivityBindingActionsChange) return;
    onActivityBindingActionsChange({ openActivityPicker });
    return () => onActivityBindingActionsChange(null);
  }, [onActivityBindingActionsChange, openActivityPicker]);

  return {
    activityPickerOpen,
    openActivityPicker,
    closeActivityPicker,
    bindSelectedActivity,
    handleActivityPicked,
  };
}
