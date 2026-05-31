import "../../../pages/profile/profile.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import React from "react";
import PageNavigation from "../../../components/PageNavigation";
import ThemedPageLoader from "../../../components/ThemedPageLoader";
import ProfileActivitiesSection from "../../../pages/profile/components/ProfileActivitiesSection";
import { profileActivities } from "../../../pages/profile/mockData";
import { isApiEnabled } from "../../../constants/api";
import { useProfileActivitiesQuery } from "../../../hooks/useSyncApi";
import { invalidateProfileActivities } from "../../../utils/queryInvalidation";
import { useStackPageMainHeight } from "../../../hooks/useTabPageMainHeight";
import { ROUTES } from "../../../utils/route";
import { useEndRouteTransitionOnShow } from "../../../hooks/useEndRouteTransitionOnShow";
import { ScrollView, View } from "@tarojs/components";

const ProfileActivitiesPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const mainScrollHeight = useStackPageMainHeight();
  const apiEnabled = isApiEnabled();
  const activitiesQuery = useProfileActivitiesQuery();
  const activities = apiEnabled && activitiesQuery.data ? activitiesQuery.data : profileActivities;
  const loading = apiEnabled && activitiesQuery.isLoading && !activitiesQuery.data;

  useDidShow(() => {
    if (apiEnabled) {
      invalidateProfileActivities();
    }
  });

  return (
    <View data-cmp="ProfileActivitiesPage" className="s-profile-stack">
      <PageNavigation title="我的活动" fallback={ROUTES.PROFILE} tone="surface" />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-profile-stack__scroll s-scrollbar-none"
        style={mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined}>
        <View className="s-profile-stack__inner">
          {loading ? (
            <ThemedPageLoader variant="inline" label="加载活动…" minHeight={120} />
          ) : (
            <ProfileActivitiesSection items={activities} mode="list" />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileActivitiesPage;
