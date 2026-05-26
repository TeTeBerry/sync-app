import "./profile.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  BellIcon,
  ChevronRightIcon,
  HelpCircleIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import { go, goEventDetail, ROUTES } from "../../utils/route";
import { profilePosts, profileUser } from "./mockData";
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const settingsRef = useRef<HTMLDivElement>(null);
  const notificationsEnabled = useProfilePageStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useProfilePageStore((state) => state.setNotificationsEnabled);
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);
  const consumeProfileIntent = useNavigationStore((state) => state.consumeProfileIntent);
  const { confirm, confirmDialog } = useConfirmDialog({
    cancelText: t("common.cancel"),
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
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  });

  useEffect(() => {
    persistUserName(profileUserData.name);
  }, [profileUserData.name]);

  const scrollToSettings = useCallback(() => {
    settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        handlePostAction(t("profile.myPosts.complete"), item);
        return;
      }
      const ok = await confirm({
        title: t("profile.myPosts.complete"),
        message: "确认将该帖子标记为已组队？",
        confirmText: t("profile.myPosts.complete"),
      });
      if (!ok) return;
      void updatePostAndInvalidate(queryClient, item.id, { status: "completed" })
        .then(() => void Taro.showToast({ title: "已更新", icon: "success" }))
        .catch(() => void Taro.showToast({ title: "更新失败", icon: "none" }));
    },
    [apiEnabled, confirm, handlePostAction, queryClient, t],
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
        handlePostAction(t("profile.myPosts.save"), item);
        handleCancelPostEdit();
        return;
      }
      const status =
        editDraft.status === "已组队" ? "completed" : ("recruiting" as const);
      void updatePostAndInvalidate(queryClient, item.id, { body, status })
        .then(() => {
          handleCancelPostEdit();
          void Taro.showToast({ title: "已保存", icon: "success" });
        })
        .catch(() => void Taro.showToast({ title: "保存失败", icon: "none" }));
    },
    [apiEnabled, editDraft, handleCancelPostEdit, handlePostAction, queryClient, t],
  );

  const handleDeletePost = useCallback(
    async (item: ProfilePostItem) => {
      const ok = await confirm({
        title: t("profile.myPosts.delete"),
        message: "删除后无法恢复，确定要删除这条帖子吗？",
        confirmText: t("profile.myPosts.delete"),
        danger: true,
      });
      if (!ok) return;
      if (!apiEnabled) {
        handlePostAction(t("profile.myPosts.delete"), item);
        return;
      }
      void deletePostAndInvalidate(queryClient, item.id)
        .then(() => {
          void Taro.showToast({ title: "已删除", icon: "success" });
        })
        .catch(() => {
          void postsQuery.refetch();
          void Taro.showToast({ title: "删除失败", icon: "none" });
        });
    },
    [apiEnabled, confirm, handlePostAction, postsQuery, queryClient, t],
  );

  const openSettings = useCallback(
    (section: "notifications" | "privacy" | "help") => {
      go(`${ROUTES.SETTINGS}?section=${section}`);
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    const ok = await confirm({
      title: t("profile.settings.logoutConfirmTitle"),
      message: t("profile.settings.logoutConfirmMessage"),
      confirmText: t("profile.settings.logout"),
      danger: true,
    });
    if (!ok) return;
    void Taro.showToast({ title: t("profile.settings.logoutSuccess"), icon: "success" });
  }, [confirm, t]);

  const profileSubtext = `${profileUserData.handle} · ${profileUserData.location} · ${profileUserData.bio}`;

  return (
    <div data-cmp="Profile" className="s-profile">
      <main className="s-profile__main s-scrollbar-none">
        <header className="s-profile__header">
          <button
            type="button"
            className="s-profile__settings-btn"
            aria-label={t("profile.settings.title")}
            onClick={scrollToSettings}
          >
            <SettingsIcon size={20} />
          </button>
        </header>

        <section className="s-profile__card">
          <div className="s-profile__card-top">
            <div className="s-profile__avatar-wrap">
              <img className="s-profile__avatar" src={profileUserData.avatar} alt={profileUserData.name} />
            </div>

            <div className="s-profile__info">
              <span className="s-profile__name">{profileUserData.name}</span>
              <span className="s-profile__subtext">{profileSubtext}</span>
            </div>
          </div>

          <div className="s-profile__stats">
            <div className="s-profile__stat">
              <span className="s-profile__stat-value">{profileUserData.stats.events}</span>
              <span className="s-profile__stat-label">{t("profile.stats.events")}</span>
            </div>
            <div className="s-profile__stat">
              <span className="s-profile__stat-value">{profileUserData.stats.matchSuccess}</span>
              <span className="s-profile__stat-label">{t("profile.stats.matchSuccess")}</span>
            </div>
            <div className="s-profile__stat">
              <span className="s-profile__stat-value">{profileUserData.stats.likes}</span>
              <span className="s-profile__stat-label">{t("profile.stats.likes")}</span>
            </div>
            <div className="s-profile__stat">
              <span className="s-profile__stat-value">{profileUserData.stats.posts}</span>
              <span className="s-profile__stat-label">{t("profile.stats.posts")}</span>
            </div>
          </div>
        </section>

        <div className="s-profile__sections">
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
        </div>

        <section ref={settingsRef} className="s-profile__settings-section">
          <div className="s-profile__settings-card">
            <button type="button" className="s-profile__settings-row" onClick={() => openSettings("notifications")}>
              <span className="s-profile__settings-icon s-profile__settings-icon--bell">
                <BellIcon size={18} />
              </span>
              <span className="s-profile__settings-label">{t("profile.settings.notifications")}</span>
              <span className="s-profile__settings-value">
                {notificationsEnabled ? t("profile.settings.enabled") : t("profile.settings.disabled")}
              </span>
              <ChevronRightIcon size={18} className="s-profile__settings-chevron" />
            </button>

            <button type="button" className="s-profile__settings-row" onClick={() => openSettings("privacy")}>
              <span className="s-profile__settings-icon s-profile__settings-icon--shield">
                <ShieldIcon size={18} />
              </span>
              <span className="s-profile__settings-label">{t("profile.settings.privacy")}</span>
              <ChevronRightIcon size={18} className="s-profile__settings-chevron" />
            </button>

            <button type="button" className="s-profile__settings-row" onClick={() => openSettings("help")}>
              <span className="s-profile__settings-icon s-profile__settings-icon--help">
                <HelpCircleIcon size={18} />
              </span>
              <span className="s-profile__settings-label">{t("profile.settings.help")}</span>
              <ChevronRightIcon size={18} className="s-profile__settings-chevron" />
            </button>

            <button
              type="button"
              className="s-profile__settings-row s-profile__settings-row--logout"
              onClick={handleLogout}
            >
              <span className="s-profile__settings-icon s-profile__settings-icon--logout">
                <LogOutIcon size={18} />
              </span>
              <span className="s-profile__settings-label">{t("profile.settings.logout")}</span>
            </button>
          </div>
        </section>
      </main>

      {confirmDialog}

      <BottomNav />
    </div>
  );
};

export default Profile;
