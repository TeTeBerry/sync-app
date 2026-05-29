import "./profile.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useCallback, useEffect } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  FileText,
  Info,
  LogOut,
  Music2,
  Shield,
  Zap,
} from "lucide-react-taro";
import TabPageHeader from "../../components/TabPageHeader";
import ThemedPageLoader from "../../components/ThemedPageLoader";
import { useNavBarInsets } from "../../hooks/useNavBarInsets";
import {
  TAB_PAGE_HEADER_BRAND_PX,
  useTabPageMainHeight,
} from "../../hooks/useTabPageMainHeight";
import { go, ROUTES } from "../../utils/route";
import { profileActivities, profilePosts, profileUser } from "./mockData";
import { sanitizeRemoteImageUrl } from "../../utils/imageUrl";
import ProfileActionCard from "./components/ProfileActionCard";
import { countOngoingActivities, deriveInterestTag } from "./utils";
import { persistUserName } from "../../utils/session";
import { useNavigationStore, useProfilePageStore } from "../../stores";
import { useProfileSummaryQuery } from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  readProfileNotificationsEnabled,
  readProfilePrivacyLevel,
} from "../../utils/profileStorage";
import { invalidateProfileSummary } from "../../utils/queryInvalidation";
import { Image, ScrollView, Text, View } from "@tarojs/components";

const Profile: React.FC = () => {
  const navInsets = useNavBarInsets();
  const headerChromePx = navInsets.paddingTop + TAB_PAGE_HEADER_BRAND_PX;
  const mainScrollHeight = useTabPageMainHeight(headerChromePx);
  const notificationsEnabled = useProfilePageStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useProfilePageStore((state) => state.setNotificationsEnabled);
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);
  const consumeProfileIntent = useNavigationStore((state) => state.consumeProfileIntent);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: "取消",
  });

  const summaryQuery = useProfileSummaryQuery();
  const apiEnabled = isApiEnabled();

  const profileUserData = apiEnabled && summaryQuery.data ? summaryQuery.data : profileUser;

  const profileLoading = apiEnabled && summaryQuery.isLoading && !summaryQuery.data;

  const ongoingCount = apiEnabled
    ? profileUserData.stats.events
    : countOngoingActivities(profileActivities);
  const postsCount = apiEnabled ? profileUserData.stats.posts : profilePosts.length;
  const interestTag = deriveInterestTag(profileUserData.bio);
  const verified =
    "verified" in profileUser && typeof profileUser.verified === "boolean"
      ? profileUser.verified
      : true;

  const applyRouteParams = useCallback(() => {
    consumeProfileIntent();
  }, [consumeProfileIntent]);

  useDidShow(() => {
    setNotificationsEnabled(readProfileNotificationsEnabled());
    setPrivacyLevel(readProfilePrivacyLevel());
    applyRouteParams();
    if (apiEnabled) {
      invalidateProfileSummary();
    }
  });

  useEffect(() => {
    persistUserName(profileUserData.name);
  }, [profileUserData.name]);

  const openSettings = useCallback(
    (section: "notifications" | "privacy" | "help") => {
      go(`${ROUTES.SETTINGS}?section=${section}`);
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    const ok = await confirm({
      title: "退出登录",
      message: "确定要退出当前账号吗？",
      confirmText: "退出登录",
    });
    if (!ok) return;
    void Taro.showToast({ title: "已退出登录", icon: "success" });
  }, [confirm]);

  const metaParts = [
    profileUserData.handle,
    profileUserData.location,
    profileUserData.bio,
  ].filter(Boolean);

  return (
    <View data-cmp="Profile" className="s-profile s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-profile">
        <TabPageHeader className="s-tab-page-header--profile" navInsets={navInsets} />

        <ScrollView
          scrollY
          enhanced
          showScrollbar={false}
          className="s-profile__scroll s-scrollbar-none"
          style={mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined}>
          <View className="s-profile__scroll-inner">
          {profileLoading ? (
            <View className="s-profile__card s-profile__card--loading">
              <ThemedPageLoader variant="inline" label="加载个人资料…" minHeight={148} />
            </View>
          ) : (
            <View className="s-profile__card">
              <View className="s-profile__card-top">
                <View className="s-profile__avatar-wrap">
                  <Image
                    className="s-profile__avatar"
                    src={
                      sanitizeRemoteImageUrl(profileUserData.avatar) ?? profileUserData.avatar
                    }
                    alt={profileUserData.name}
                  />
                  <View className="s-profile__online-dot" aria-label="在线" />
                </View>

                <View className="s-profile__info">
                  <Text className="s-profile__name">{profileUserData.name}</Text>
                  {metaParts.length > 0 ? (
                    <Text className="s-profile__meta-line">{metaParts.join(" · ")}</Text>
                  ) : null}
                  {interestTag || verified ? (
                    <View className="s-profile__tags">
                      {interestTag ? (
                        <View className="s-profile__tag s-profile__tag--primary">
                          <Music2 size={12} />
                          <Text>{interestTag}</Text>
                        </View>
                      ) : null}
                      {verified ? (
                        <View className="s-profile__tag s-profile__tag--verified">
                          <Check size={12} strokeWidth={3} />
                          <Text>已认证</Text>
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>

              <View className="s-profile__stats" aria-label="个人数据">
                <View className="s-profile__stat">
                  <Text className="s-profile__stat-value">{profileUserData.stats.events}</Text>
                  <Text className="s-profile__stat-label">参加活动</Text>
                </View>
                <View className="s-profile__stat s-profile__stat--accent">
                  <Text className="s-profile__stat-value">
                    {profileUserData.stats.matchSuccess}
                  </Text>
                  <Text className="s-profile__stat-label">组队成功</Text>
                </View>
                <View className="s-profile__stat">
                  <Text className="s-profile__stat-value">{profileUserData.stats.likes}</Text>
                  <Text className="s-profile__stat-label">获赞数</Text>
                </View>
                <View className="s-profile__stat">
                  <Text className="s-profile__stat-value">{profileUserData.stats.posts}</Text>
                  <Text className="s-profile__stat-label">我的帖子</Text>
                </View>
              </View>
            </View>
          )}

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
            subtitle={`${postsCount} 篇发布的帖子`}
            onClick={() => go(ROUTES.PROFILE_POSTS)}
          />

          <View className="s-profile__settings-card">
            <View
              className="s-profile__settings-row"
              hoverClass="s-profile__settings-row--pressed"
              onClick={() => openSettings("notifications")}>
              <View className="s-profile__settings-icon s-profile__settings-icon--bell">
                <Bell size={18} />
              </View>
              <Text className="s-profile__settings-label">通知设置</Text>
              <Text className="s-profile__settings-value">
                {notificationsEnabled ? "已开启" : "已关闭"}
              </Text>
              <ChevronRight size={18} className="s-profile__settings-chevron" />
            </View>

            <View
              className="s-profile__settings-row"
              hoverClass="s-profile__settings-row--pressed"
              onClick={() => openSettings("privacy")}>
              <View className="s-profile__settings-icon s-profile__settings-icon--shield">
                <Shield size={18} />
              </View>
              <Text className="s-profile__settings-label">隐私与安全</Text>
              <ChevronRight size={18} className="s-profile__settings-chevron" />
            </View>

            <View
              className="s-profile__settings-row"
              hoverClass="s-profile__settings-row--pressed"
              onClick={() => openSettings("help")}>
              <View className="s-profile__settings-icon s-profile__settings-icon--help">
                <Info size={18} />
              </View>
              <Text className="s-profile__settings-label">帮助与反馈</Text>
              <ChevronRight size={18} className="s-profile__settings-chevron" />
            </View>

            <View
              className="s-profile__settings-row s-profile__settings-row--logout"
              hoverClass="s-profile__settings-row--pressed"
              onClick={handleLogout}>
              <View className="s-profile__settings-icon s-profile__settings-icon--logout">
                <LogOut size={18} />
              </View>
              <Text className="s-profile__settings-label s-profile__settings-label--logout">
                退出登录
              </Text>
            </View>
          </View>

            <View className="s-profile__scroll-spacer s-tabbar-offset" />
          </View>
        </ScrollView>
      </View>

      {confirmDialog}
    </View>
  );
};

export default Profile;
