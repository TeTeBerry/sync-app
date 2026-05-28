import "./profile.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useCallback, useEffect, useState } from "react";
import { Bell, ChevronRight, Info, LogOut, Settings, Shield } from "lucide-react-taro";
import { BottomNavSlot } from "../../components/BottomNav";
import { go, goEventDetail, ROUTES } from "../../utils/route";
import { profilePosts, profileUser } from "./mockData";
import { sanitizeRemoteImageUrl } from "../../utils/imageUrl";
import ProfileActivitiesSection from "./components/ProfileActivitiesSection";
import ProfilePostsSection, {
  type ProfilePostEditDraft,
} from "./components/ProfilePostsSection";
import type { ProfilePostItem } from "../../types/backend";
import { persistUserName } from "../../utils/session";
import { useNavigationStore, useProfilePageStore } from "../../stores";
import {
  deletePostAndInvalidate,
  updatePostAndInvalidate,
  useProfileActivitiesQuery,
  useProfilePostsQuery,
  useProfileSummaryQuery,
} from "../../hooks/useSyncApi";
import { isApiEnabled } from "../../constants/api";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { invalidateCache } from "../../hooks/useApiQuery";
import { Button, Image, ScrollView, Text, View } from "@tarojs/components";

const STORAGE_KEYS = {
  notifications: "profile.notificationsEnabled",
  privacy: "profile.privacyLevel",
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(key);
    return raw !== "" && raw != null ? (raw as T) : fallback;
  } catch {
    return fallback;
  }
}

const Profile: React.FC = () => {
  const [scrollIntoView, setScrollIntoView] = useState<string | undefined>();
  const notificationsEnabled = useProfilePageStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useProfilePageStore((state) => state.setNotificationsEnabled);
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);
  const consumeProfileIntent = useNavigationStore((state) => state.consumeProfileIntent);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: "取消",
  });

  const summaryQuery = useProfileSummaryQuery();
  const activitiesQuery = useProfileActivitiesQuery();
  const postsQuery = useProfilePostsQuery();
  const apiEnabled = isApiEnabled();

  const profileUserData = apiEnabled && summaryQuery.data
    ? summaryQuery.data
    : profileUser;

  const activities = activitiesQuery.data ?? [];

  const posts = apiEnabled && postsQuery.data
    ? postsQuery.data
    : profilePosts;

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ProfilePostEditDraft | null>(null);

  const applyRouteParams = useCallback(() => {
    consumeProfileIntent();
  }, [consumeProfileIntent]);

  useDidShow(() => {
    setNotificationsEnabled(readStorage(STORAGE_KEYS.notifications, true));
    setPrivacyLevel(readStorage<string>(STORAGE_KEYS.privacy, "public"));
    applyRouteParams();
    if (apiEnabled) {
      invalidateCache(["profile"]);
    }
  });

  useEffect(() => {
    persistUserName(profileUserData.name);
  }, [profileUserData.name]);

  const scrollToSettings = useCallback(() => {
    setScrollIntoView(undefined);
    setTimeout(() => setScrollIntoView("profile-settings"), 0);
  }, []);

  const handlePostAction = useCallback((action: string, item: ProfilePostItem) => {
    void Taro.showToast({ title: `${action}: ${item.title}`, icon: "none" });
  }, []);

  const handleSelectPost = useCallback((item: ProfilePostItem) => {
    const activityLegacyId = item.activityLegacyId;
    if (activityLegacyId == null || Number.isNaN(activityLegacyId)) {
      void Taro.showToast({ title: "无法打开该帖子所属活动", icon: "none" });
      return;
    }
    goEventDetail(activityLegacyId, { postId: item.id });
  }, []);

  const handleCompletePost = useCallback(
    async (item: ProfilePostItem) => {
      if (!apiEnabled) {
        handlePostAction("标记已组队", item);
        return;
      }
      const ok = await confirm({
        title: "标记已组队",
        message: "确认将该帖子标记为已组队？",
        confirmText: "标记已组队",
      });
      if (!ok) return;
      void updatePostAndInvalidate(item.id, { status: "completed" })
        .then(() => void Taro.showToast({ title: "已更新", icon: "success" }))
        .catch(() => void Taro.showToast({ title: "更新失败", icon: "none" }));
    },
    [apiEnabled, confirm, handlePostAction],
  );

  const handleEditPost = useCallback((item: ProfilePostItem) => {
    if (editingPostId === item.id) {
      setEditingPostId(null);
      setEditDraft(null);
      return;
    }
    setEditingPostId(item.id);
    setEditDraft({
      body: item.content,
      status: item.status === "已组队" ? "已组队" : "招募中",
    });
  }, [editingPostId]);

  const handleCancelPostEdit = useCallback(() => {
    setEditingPostId(null);
    setEditDraft(null);
  }, []);

  const handleSavePostEdit = useCallback(
    (item: ProfilePostItem) => {
      if (!editDraft) return;
      const body = editDraft.body.trim();
      if (!body) {
        void Taro.showToast({ title: "帖子内容不能为空", icon: "none" });
        return;
      }
      if (!apiEnabled) {
        handlePostAction("保存修改", item);
        handleCancelPostEdit();
        return;
      }
      const status =
        editDraft.status === "已组队" ? "completed" : ("recruiting" as const);
      void updatePostAndInvalidate(item.id, { body, status })
        .then(() => {
          handleCancelPostEdit();
          void Taro.showToast({ title: "已保存", icon: "success" });
        })
        .catch(() => void Taro.showToast({ title: "保存失败", icon: "none" }));
    },
    [apiEnabled, editDraft, handleCancelPostEdit, handlePostAction],
  );

  const handleDeletePost = useCallback(
    async (item: ProfilePostItem) => {
      const ok = await confirm({
        title: "删除",
        message: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: "删除",
      });
      if (!ok) return;
      if (!apiEnabled) {
        handlePostAction("删除", item);
        return;
      }
      void deletePostAndInvalidate(item.id)
        .then(() => {
          void Taro.showToast({ title: "已删除", icon: "success" });
        })
        .catch(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: "删除失败", icon: "none" });
        });
    },
    [apiEnabled, confirm, handlePostAction, postsQuery],
  );

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

  const profileSubtext = `${profileUserData.handle} · ${profileUserData.location} · ${profileUserData.bio}`;

  return (
    <View data-cmp="Profile" className="s-profile s-page-with-tabbar">
      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        scrollIntoView={scrollIntoView}
        className="s-page-with-tabbar__scroll s-profile__main s-scrollbar-none">
        <View className="s-profile__header">
          <Button className="s-profile__settings-btn"
            aria-label="设置"
            onClick={scrollToSettings}>
            <Settings size={20} />
          </Button>
        </View>

        <View className="s-profile__card">
          <View className="s-profile__card-top">
            <View className="s-profile__avatar-wrap">
              <Image
                className="s-profile__avatar"
                src={sanitizeRemoteImageUrl(profileUserData.avatar) ?? profileUserData.avatar}
                alt={profileUserData.name}
              />
            </View>

            <View className="s-profile__info">
              <Text className="s-profile__name">{profileUserData.name}</Text>
              <Text className="s-profile__subtext">{profileSubtext}</Text>
            </View>
          </View>

          <View className="s-profile__stats">
            <View className="s-profile__stat">
              <Text className="s-profile__stat-value">{profileUserData.stats.events}</Text>
              <Text className="s-profile__stat-label">参加活动</Text>
            </View>
            <View className="s-profile__stat">
              <Text className="s-profile__stat-value">{profileUserData.stats.matchSuccess}</Text>
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

        <View className="s-profile__sections">
          <ProfileActivitiesSection items={activities} />
          <ProfilePostsSection
            items={posts}
            editingPostId={editingPostId}
            editDraft={editDraft}
            onSelect={handleSelectPost}
            onComplete={handleCompletePost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
            onEditDraftChange={setEditDraft}
            onSaveEdit={handleSavePostEdit}
            onCancelEdit={handleCancelPostEdit}
          />
        </View>

        <View id="profile-settings" className="s-profile__settings-section s-tabbar-offset">
          <View className="s-profile__settings-card">
            <Button className="s-profile__settings-row" onClick={() => openSettings("notifications")}>
              <Text className="s-profile__settings-icon s-profile__settings-icon--bell">
                <Bell size={18} />
              </Text>
              <Text className="s-profile__settings-label">通知设置</Text>
              <Text className="s-profile__settings-value">
                {notificationsEnabled ? "已开启" : "已关闭"}
              </Text>
              <ChevronRight size={18} className="s-profile__settings-chevron" />
            </Button>

            <Button className="s-profile__settings-row" onClick={() => openSettings("privacy")}>
              <Text className="s-profile__settings-icon s-profile__settings-icon--shield">
                <Shield size={18} />
              </Text>
              <Text className="s-profile__settings-label">隐私与安全</Text>
              <ChevronRight size={18} className="s-profile__settings-chevron" />
            </Button>

            <Button className="s-profile__settings-row" onClick={() => openSettings("help")}>
              <Text className="s-profile__settings-icon s-profile__settings-icon--help">
                <Info size={18} />
              </Text>
              <Text className="s-profile__settings-label">帮助与反馈</Text>
              <ChevronRight size={18} className="s-profile__settings-chevron" />
            </Button>

            <Button className="s-profile__settings-row s-profile__settings-row--logout"
              onClick={handleLogout}>
              <Text className="s-profile__settings-icon s-profile__settings-icon--logout">
                <LogOut size={18} />
              </Text>
              <Text className="s-profile__settings-label">退出登录</Text>
            </Button>
          </View>
        </View>
      </ScrollView>

      {confirmDialog}

      <BottomNavSlot />
    </View>
  );
};

export default Profile;
