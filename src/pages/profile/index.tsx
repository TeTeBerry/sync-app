import "./profile.scss";
import Taro, { useDidShow } from "@tarojs/taro";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AwardIcon,
  BellIcon,
  CalendarIcon,
  CameraIcon,
  ChevronRightIcon,
  FlameIcon,
  HelpCircleIcon,
  LogOutIcon,
  MapPinIcon,
  SettingsIcon,
  ShieldIcon,
  TrendingUpIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import BottomNav from "../../components/BottomNav";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useProfileParticipatedItems } from "../../hooks/useSyncApi";
import { go, ROUTES } from "../../utils/route";
import { profileUser } from "./mockData";
import ProfileParticipatedList from "./components/ProfileParticipatedList";
import { persistUserName } from "../../utils/session";
import { useNavigationStore, useProfilePageStore } from "../../stores";

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
  const settingsRef = useRef<HTMLDivElement>(null);
  const notificationsEnabled = useProfilePageStore((state) => state.notificationsEnabled);
  const privacyLevel = useProfilePageStore((state) => state.privacyLevel);
  const setNotificationsEnabled = useProfilePageStore((state) => state.setNotificationsEnabled);
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);
  const consumeProfileIntent = useNavigationStore((state) => state.consumeProfileIntent);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const participated = useProfileParticipatedItems();

  const applyRouteParams = useCallback(() => {
    consumeProfileIntent();
  }, [consumeProfileIntent]);

  useDidShow(() => {
    setNotificationsEnabled(readStorage(STORAGE_KEYS.notifications, true));
    setPrivacyLevel(readStorage<string>(STORAGE_KEYS.privacy, "public"));
    applyRouteParams();
  });

  useEffect(() => {
    persistUserName(profileUser.name);
  }, []);

  const { level } = profileUser;
  const progressPercent = useMemo(
    () => Math.round((level.xp / level.xpMax) * 100),
    [level.xp, level.xpMax],
  );

  const privacyLabel = t(`profile.settings.privacyOptions.${privacyLevel}`);

  const scrollToSettings = useCallback(() => {
    settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleAvatarEdit = useCallback(() => {
    void Taro.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: () => {
        void Taro.showToast({ title: t("profile.avatarUpdated"), icon: "success" });
      },
    }).catch(() => {});
  }, [t]);

  const handleParticipatedTap = useCallback((title: string) => {
    void Taro.showToast({ title, icon: "none" });
  }, []);

  const openSettings = useCallback(
    (section: "notifications" | "privacy" | "help") => {
      go(`${ROUTES.SETTINGS}?section=${section}`);
    },
    [],
  );

  const handleLogout = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutCancel = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    setShowLogoutConfirm(false);
    void Taro.showToast({ title: t("profile.settings.logoutSuccess"), icon: "success" });
  }, [t]);

  return (
    <div data-cmp="Profile" className="s-profile">
      <main className="s-profile__main s-scrollbar-none">
        <header className="s-profile__header">
          <h1 className="s-profile__title">{t("profile.title")}</h1>
          <button type="button" className="s-profile__settings-btn" aria-label={t("profile.settings.title")} onClick={scrollToSettings}>
            <SettingsIcon size={20} />
          </button>
        </header>

        <section className="s-profile__card">
          <div className="s-profile__card-top">
            <div className="s-profile__avatar-wrap">
              <img className="s-profile__avatar" src={profileUser.avatar} alt={profileUser.name} />
              {profileUser.isOnline && <span className="s-profile__online-dot" aria-hidden />}
              <button type="button" className="s-profile__avatar-edit" aria-label={t("profile.editAvatar")} onClick={handleAvatarEdit}>
                <CameraIcon size={12} />
              </button>
            </div>

            <div className="s-profile__info">
              <div className="s-profile__name-row">
                <span className="s-profile__name">{profileUser.name}</span>
                {profileUser.isVip && <span className="s-profile__vip-badge">VIP</span>}
                <span className="s-profile__medal" aria-hidden>
                  <AwardIcon size={18} />
                </span>
              </div>
              <div className="s-profile__location">
                <MapPinIcon size={14} />
                <span>{profileUser.location}</span>
              </div>
            </div>
          </div>

          <div className="s-profile__stats">
            <div className="s-profile__stat">
              <CalendarIcon size={16} className="s-profile__stat-icon" />
              <span className="s-profile__stat-value">{profileUser.stats.events}</span>
              <span className="s-profile__stat-label">{t("profile.stats.events")}</span>
            </div>
            <div className="s-profile__stat">
              <UsersIcon size={16} className="s-profile__stat-icon" />
              <span className="s-profile__stat-value">{profileUser.stats.pinSuccess}</span>
              <span className="s-profile__stat-label">{t("profile.stats.pinSuccess")}</span>
            </div>
            <div className="s-profile__stat">
              <TrendingUpIcon size={16} className="s-profile__stat-icon" />
              <span className="s-profile__stat-value">{profileUser.stats.buddies}</span>
              <span className="s-profile__stat-label">{t("profile.stats.buddies")}</span>
            </div>
          </div>
        </section>

        <section className="s-profile__level-card">
          <div className="s-profile__level-head">
            <div className="s-profile__level-title">
              <FlameIcon size={18} />
              <span>{t("profile.level.title", { level: level.current })}</span>
            </div>
            <div className="s-profile__level-xp-hint">
              <ZapIcon size={14} />
              <span>
                {t("profile.level.xpToNext", { xp: level.xpToNext, nextLevel: level.current + 1 })}
              </span>
            </div>
          </div>
          <div className="s-profile__progress-track">
            <div className="s-profile__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="s-profile__level-foot">
            <span>
              {t("profile.level.xpProgress", { current: level.xp.toLocaleString(), max: level.xpMax.toLocaleString() })}
            </span>
            <span>{progressPercent}%</span>
          </div>
        </section>

        <div className="s-profile__section-head">
          <h2>{t("profile.tabs.participated")}</h2>
        </div>

        <div className="s-profile__events">
          <ProfileParticipatedList
            items={participated.items}
            isLoading={participated.isLoading}
            isError={participated.isError}
            onRetry={() => void participated.refetch()}
            onItemTap={(item) => handleParticipatedTap(item.title)}
          />
        </div>

        <section ref={settingsRef} className="s-profile__settings-section">
          <div className="s-profile__settings-head">
            <SettingsIcon size={16} />
            <span>{t("profile.settings.title")}</span>
          </div>

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
              <span className="s-profile__settings-value">{privacyLabel}</span>
              <ChevronRightIcon size={18} className="s-profile__settings-chevron" />
            </button>

            <button type="button" className="s-profile__settings-row" onClick={() => openSettings("help")}>
              <span className="s-profile__settings-icon s-profile__settings-icon--help">
                <HelpCircleIcon size={18} />
              </span>
              <span className="s-profile__settings-label">{t("profile.settings.help")}</span>
              <ChevronRightIcon size={18} className="s-profile__settings-chevron" />
            </button>

            <button type="button" className="s-profile__settings-row s-profile__settings-row--logout" onClick={handleLogout}>
              <span className="s-profile__settings-icon s-profile__settings-icon--logout">
                <LogOutIcon size={18} />
              </span>
              <span className="s-profile__settings-label">{t("profile.settings.logout")}</span>
              <ChevronRightIcon size={18} className="s-profile__settings-chevron" />
            </button>
          </div>
        </section>
      </main>

      <ConfirmDialog
        open={showLogoutConfirm}
        title={t("profile.settings.logoutConfirmTitle")}
        message={t("profile.settings.logoutConfirmMessage")}
        confirmLabel={t("profile.settings.logout")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      <BottomNav />
    </div>
  );
};

export default Profile;
