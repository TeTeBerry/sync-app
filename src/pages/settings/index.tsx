import "./settings.scss";
import Taro, { useRouter } from "@tarojs/taro";
import React, { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react-taro";
import PageNavigation from "../../components/PageNavigation";
import { ROUTES } from "../../utils/route";
import { updateCurrentUserAndInvalidate, useCurrentUserQuery } from "../../hooks/useSyncApi";
import { saveEncryptedProfileSnapshot } from "../../utils/profileSnapshotStorage";
import { useProfilePageStore } from "../../stores/profilePageStore";
import { Button, Text, View } from '@tarojs/components';

type SettingsSection = "notifications" | "privacy" | "help";
type PrivacyLevel = "public" | "friends" | "private";

const STORAGE_KEYS = {
  notifications: "profile.notificationsEnabled",
  privacy: "profile.privacyLevel",
} as const;

const SECTION_TITLES: Record<SettingsSection, string> = {
  notifications: "消息通知",
  privacy: "隐私设置",
  help: "帮助与反馈",
};

const PRIVACY_LABELS: Record<PrivacyLevel, string> = {
  public: "公开",
  friends: "仅好友",
  private: "私密",
};

const PRIVACY_DESCS: Record<PrivacyLevel, string> = {
  public: "所有人可见你的主页和活动记录",
  friends: "仅互相关注的用户可见",
  private: "仅自己可见",
};

const FAQ_QA = [
  {
    q: "如何发布组队帖？",
    a: "进入活动详情页，通过 AI 助手描述你的需求，或在「我的帖子」中管理已发布内容。",
  },
  {
    q: "如何找到同行伙伴？",
    a: "浏览热门帖子或在活动详情页使用 AI 精准匹配，找到志同道合的队友。",
  },
  {
    q: "如何提升个人影响力？",
    a: "参与活动、成功组队、发布优质帖子均可获得互动与认可。",
  },
] as const;

function readBool(key: string, fallback: boolean): boolean {
  try {
    const raw = Taro.getStorageSync(key);
    if (raw === "") return fallback;
    return Boolean(raw);
  } catch {
    return fallback;
  }
}

function readPrivacy(key: string, fallback: PrivacyLevel): PrivacyLevel {
  try {
    const raw = Taro.getStorageSync(key) as PrivacyLevel;
    return raw || fallback;
  } catch {
    return fallback;
  }
}

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const section = (router.params.section ?? "notifications") as SettingsSection;
  const { data: currentUser } = useCurrentUserQuery();
  const setStoreNotificationsEnabled = useProfilePageStore(
    (state) => state.setNotificationsEnabled,
  );

  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    readBool(STORAGE_KEYS.notifications, true),
  );
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(() =>
    readPrivacy(STORAGE_KEYS.privacy, "public"),
  );

  const setStorePrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);

  useEffect(() => {
    if (currentUser?.notificationsEnabled == null) return;
    setNotificationsEnabled(currentUser.notificationsEnabled);
    setStoreNotificationsEnabled(currentUser.notificationsEnabled);
    Taro.setStorageSync(STORAGE_KEYS.notifications, currentUser.notificationsEnabled);
  }, [currentUser?.notificationsEnabled, setStoreNotificationsEnabled]);

  useEffect(() => {
    if (!currentUser?.privacyLevel) return;
    setPrivacyLevel(currentUser.privacyLevel);
    setStorePrivacyLevel(currentUser.privacyLevel);
    Taro.setStorageSync(STORAGE_KEYS.privacy, currentUser.privacyLevel);
  }, [currentUser?.privacyLevel, setStorePrivacyLevel]);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      Taro.setStorageSync(STORAGE_KEYS.notifications, next);
      setStoreNotificationsEnabled(next);

      void updateCurrentUserAndInvalidate({
        notificationsEnabled: next,
      }).catch(() => undefined);

      void saveEncryptedProfileSnapshot({
        notificationsEnabled: next,
        city: currentUser?.city,
        favorGenres: currentUser?.favorGenres,
        likeMate: currentUser?.likeMate,
        budgetLevel: currentUser?.budgetLevel,
      });

      return next;
    });
  }, [
    currentUser?.budgetLevel,
    currentUser?.city,
    currentUser?.favorGenres,
    currentUser?.likeMate,
    setStoreNotificationsEnabled,
  ]);

  const selectPrivacy = useCallback((level: PrivacyLevel) => {
    setPrivacyLevel(level);
    setStorePrivacyLevel(level);
    Taro.setStorageSync(STORAGE_KEYS.privacy, level);
    void updateCurrentUserAndInvalidate({ privacyLevel: level })
      .then(() => {
        void Taro.showToast({ title: "已保存", icon: "success" });
      })
      .catch(() => {
        void Taro.showToast({ title: "请求失败，请稍后重试", icon: "none" });
      });
  }, [setStorePrivacyLevel]);

  const submitFeedback = useCallback(() => {
    void Taro.showToast({ title: "反馈已提交，感谢！", icon: "success" });
  }, []);

  const privacyOptions: PrivacyLevel[] = ["public", "friends", "private"];

  return (
    <View data-cmp="Settings" className="s-settings">
      <PageNavigation title={SECTION_TITLES[section]} fallback={ROUTES.PROFILE} />

      <View className="s-settings__main">
        {section === "notifications" && (
          <View className="s-settings__card">
            <View className="s-settings__row">
              <View>
                <View className="s-settings__row-label">推送通知</View>
                <View className="s-settings__row-desc">接收活动提醒、互动消息等</View>
              </View>
              <Button role="switch"
                aria-checked={notificationsEnabled}
                className={`s-settings__toggle${notificationsEnabled ? " s-settings__toggle--on" : ""}`}
                onClick={toggleNotifications}>
                <Text className="s-settings__toggle-knob" />
              </Button>
            </View>
            <View className="s-settings__row">
              <View>
                <View className="s-settings__row-label">活动提醒</View>
                <View className="s-settings__row-desc">活动开始前 24 小时提醒</View>
              </View>
              <Button role="switch"
                aria-checked={notificationsEnabled}
                className={`s-settings__toggle${notificationsEnabled ? " s-settings__toggle--on" : ""}`}
                onClick={toggleNotifications}>
                <Text className="s-settings__toggle-knob" />
              </Button>
            </View>
          </View>
        )}

        {section === "privacy" && (
          <View className="s-settings__card">
            {privacyOptions.map((level) => (
              <Button
                key={level} className={`s-settings__option${privacyLevel === level ? " s-settings__option--selected" : ""}`}
                onClick={() => selectPrivacy(level)}>
                <View>
                  <View className="s-settings__option-label">{PRIVACY_LABELS[level]}</View>
                  <View className="s-settings__option-desc">{PRIVACY_DESCS[level]}</View>
                </View>
                {privacyLevel === level && <Check size={20} className="s-settings__check" />}
              </Button>
            ))}
          </View>
        )}

        {section === "help" && (
          <>
            <View className="s-settings__card s-settings__faq">
              {FAQ_QA.map((item, idx) => (
                <View key={idx} className="s-settings__faq-item">
                  <View className="s-settings__faq-q">{item.q}</View>
                  <View className="s-settings__faq-a">{item.a}</View>
                </View>
              ))}
            </View>
            <Button className="s-settings__feedback-btn" onClick={submitFeedback}>
              提交反馈
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

export default SettingsPage;
