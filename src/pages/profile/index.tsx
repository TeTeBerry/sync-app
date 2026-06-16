import '../../components/profile/profile.scss';
import React from 'react';
import { FileText, Zap } from '../../components/icons';
import TabPageHeader from '../../components/navigation/TabPageHeader';
import ThemedPageLoader from '../../components/ThemedPageLoader';
import { useNavBarInsets } from '../../hooks/useNavBarInsets';
import {
  TAB_PAGE_HEADER_BRAND_PX,
  useTabPageMainHeight,
} from '../../hooks/useTabPageMainHeight';
import { go, ROUTES } from '../../utils/route';
import ProfileGuestSection from '../../components/profile/ProfileGuestSection';
import { ProfileTabErrorBoundary } from '../../components/profile/ProfileTabErrorBoundary';
import ProfileActionCard from '../../components/profile/ProfileActionCard';
import ProfileSettingsSection from '../../components/profile/ProfileSettingsSection';
import { AccountRiskBanner } from '../../components/account-risk/AccountRiskBanner';
import ProfileSummarySection from '../../components/profile/ProfileSummarySection';
import { useProfilePage } from '../../components/profile/useProfilePage';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ScrollView, View } from '@tarojs/components';

const Profile: React.FC = () => {
  const navInsets = useNavBarInsets();
  const headerChromePx = navInsets.paddingTop + TAB_PAGE_HEADER_BRAND_PX;
  const mainScrollHeight = useTabPageMainHeight(headerChromePx);
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });

  const {
    showGuestProfile,
    profileLoading,
    profileUserData,
    interestTag,
    ongoingCount,
    postsCount,
    accountRisk,
    settings,
    handleAuthLoggedIn,
    handleProfileRetry,
  } = useProfilePage({ confirm });

  return (
    <View data-cmp="Profile" className="s-profile s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-profile">
        <TabPageHeader className="s-tab-page-header--profile" navInsets={navInsets} />

        {showGuestProfile ? (
          <View className="s-profile__guest-body s-scrollbar-none">
            <ProfileTabErrorBoundary onRetry={handleProfileRetry}>
              <ProfileGuestSection
                onLoggedIn={handleAuthLoggedIn}
                onOpenHelp={settings.onOpenHelp}
                onOpenLegal={settings.onOpenLegal}
              />
            </ProfileTabErrorBoundary>
          </View>
        ) : (
          <ScrollView
            scrollY
            enhanced
            showScrollbar={false}
            className="s-profile__scroll s-scrollbar-none"
            style={
              mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
            }
          >
            <ProfileTabErrorBoundary onRetry={handleProfileRetry}>
              <View className="s-profile__scroll-inner">
                {profileLoading ? (
                  <View className="s-profile__card s-profile__card--loading">
                    <ThemedPageLoader
                      variant="inline"
                      label="加载个人资料…"
                      minHeight={148}
                    />
                  </View>
                ) : (
                  <>
                    <AccountRiskBanner accountRisk={accountRisk} />
                    <ProfileSummarySection
                      user={profileUserData}
                      interestTag={interestTag}
                    />
                    <ProfileActionCard
                      accent="activities"
                      icon={<Zap size={20} />}
                      title="我的活动"
                      badge={ongoingCount}
                      subtitle={`${ongoingCount} 个进行中的活动`}
                      onClick={() => go(ROUTES.PROFILE_ACTIVITIES)}
                    />
                    <ProfileActionCard
                      accent="posts"
                      icon={<FileText size={20} />}
                      title="我的帖子"
                      badge={postsCount}
                      subtitle={`${postsCount} 条帖子`}
                      onClick={() => go(ROUTES.PROFILE_POSTS)}
                    />
                    <ProfileSettingsSection {...settings} />
                    <View className="s-profile__scroll-spacer" />
                  </>
                )}
              </View>
            </ProfileTabErrorBoundary>
          </ScrollView>
        )}
      </View>

      {confirmDialog}
      <LoginInterceptHost />
    </View>
  );
};

export default Profile;
