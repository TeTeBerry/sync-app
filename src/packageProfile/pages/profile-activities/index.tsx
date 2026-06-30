import '../../../components/profile/profile.scss';
import { useDidShow } from '@tarojs/taro';
import React, { useCallback } from 'react';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { ProfileActivitiesSection } from '../../../components/profile';
import { isLiveApi } from '../../../constants/api';
import { useProfileActivitiesQuery } from '../../../hooks/useSyncApi';
import { invalidateProfileActivities } from '../../../utils/queryInvalidation';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { goEventDetail, ROUTES } from '../../../utils/route';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { hydrateActivitySubscriptionStore } from '@/stores/activitySubscriptionActions';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { requestUnfollowActivityConfirm } from '../../../utils/unfollowActivityConfirm';
import { useT } from '@/hooks/useI18n';
import { View } from '@tarojs/components';
import { OverlayAwareScrollView } from '../../../components/layout/OverlayAwareScrollView';

const ProfileActivitiesPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const t = useT();
  const mainScrollHeight = useStackPageMainHeight();
  const apiEnabled = isLiveApi();
  const activitiesQuery = useProfileActivitiesQuery();
  const activities = activitiesQuery.data ?? [];
  const loading = activitiesQuery.isLoading && !activitiesQuery.data;
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t('common.cancel'),
  });

  useDidShow(() => {
    if (apiEnabled) {
      invalidateProfileActivities();
      void hydrateActivitySubscriptionStore();
    }
  });

  const handleConfirmUnfollow = useCallback(
    (eventTitle: string) => requestUnfollowActivityConfirm(confirm, eventTitle),
    [confirm],
  );

  return (
    <View data-cmp="ProfileActivitiesPage" className="s-profile-stack">
      <PageNavigation title="我的活动" fallback={ROUTES.PROFILE} tone="surface" />

      <OverlayAwareScrollView
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
              onConfirmUnfollow={handleConfirmUnfollow}
            />
          )}
        </View>
      </OverlayAwareScrollView>

      {confirmDialog}
    </View>
  );
};

export default ProfileActivitiesPage;
