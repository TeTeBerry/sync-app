import '../../../components/profile/profile.scss';
import { useDidShow } from '@tarojs/taro';
import React, { useCallback, useState } from 'react';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { ProfileActivitiesSection } from '../../../components/profile';
import { isLiveApi } from '../../../constants/api';
import { useProfileActivitiesQuery } from '../../../hooks/useSyncApi';
import { invalidateProfileActivities } from '../../../utils/queryInvalidation';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { goEventDetail, ROUTES } from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { parseActivityLegacyId } from '../../../utils/activityLegacyId';
import { unsubscribeFromActivityUpdates } from '../../../utils/subscribeToActivityUpdates';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { requestUnfollowActivityConfirm } from '../../../utils/unfollowActivityConfirm';
import { useT } from '@/hooks/useI18n';
import { ScrollView, View } from '@tarojs/components';

const ProfileActivitiesPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const t = useT();
  const mainScrollHeight = useStackPageMainHeight();
  const apiEnabled = isLiveApi();
  const activitiesQuery = useProfileActivitiesQuery();
  const activities = activitiesQuery.data ?? [];
  const loading = activitiesQuery.isLoading && !activitiesQuery.data;
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });

  useDidShow(() => {
    if (apiEnabled) {
      invalidateProfileActivities();
    }
  });

  const handleUnfollow = useCallback(
    async (activityLegacyId: string, eventTitle: string) => {
      const legacyId = parseActivityLegacyId(activityLegacyId);
      if (legacyId == null || unfollowingId != null) {
        return;
      }

      const confirmed = await requestUnfollowActivityConfirm(confirm, eventTitle);
      if (!confirmed) {
        return;
      }

      setUnfollowingId(activityLegacyId);
      try {
        const result = await unsubscribeFromActivityUpdates(legacyId);
        if (result === 'success') {
          invalidateProfileActivities();
          void activitiesQuery.refetch();
        }
      } finally {
        setUnfollowingId(null);
      }
    },
    [activitiesQuery, confirm, unfollowingId],
  );

  return (
    <View data-cmp="ProfileActivitiesPage" className="s-profile-stack">
      <PageNavigation title="我的活动" fallback={ROUTES.PROFILE} tone="surface" />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-profile-stack__scroll s-scrollbar-none"
        style={
          mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
        }
      >
        <View className="s-profile-stack__inner">
          {loading ? (
            <ThemedPageLoader variant="inline" label="加载活动…" minHeight={120} />
          ) : (
            <ProfileActivitiesSection
              items={activities}
              mode="list"
              onClick={(activityLegacyId) => goEventDetail(activityLegacyId)}
              onUnfollow={handleUnfollow}
              unfollowingId={unfollowingId}
            />
          )}
        </View>
      </ScrollView>

      {confirmDialog}
    </View>
  );
};

export default ProfileActivitiesPage;
