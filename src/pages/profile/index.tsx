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
import { useProfilePindanQuery } from "../../hooks/useSyncApi";
import { leavePindan } from "../../api/syncApi";
import { isApiEnabled } from "../../constants/api";
import { go, ROUTES } from "../../utils/route";
import {
  participatedEvents,
  myPinDanEvents,
  profileUser,
  type ProfileEventItem,
} from "./mockData";
import ProfilePinDanList from "./components/ProfilePinDanList";
import { loadMyPindanItems, removeJoinedPindanItem } from "../../utils/myPindanStorage";
import { getClientUserId } from "../../utils/session";

type ProfileTab = "participated" | "pindan";

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

function parseProfileRouteParams() {
  const params = Taro.getCurrentInstance().router?.params;
  const tab = params?.tab === `pindan` ? `pindan` : null;
  const highlightId = Number(params?.highlightId);
  return {
    tab,
    highlightId: highlightId && !Number.isNaN(highlightId) ? highlightId : null,
  };
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const profilePindanQuery = useProfilePindanQuery();
  const settingsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>("participated");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyLevel, setPrivacyLevel] = useState("public");
  const [myPindanItems, setMyPindanItems] = useState(() => loadMyPindanItems(myPinDanEvents));
  const [highlightPindanId, setHighlightPindanId] = useState<number | null>(null);

  const applyRouteParams = useCallback(() => {
    const { tab, highlightId } = parseProfileRouteParams();
    if (tab === `pindan`) setActiveTab(`pindan`);
    if (highlightId) setHighlightPindanId(highlightId);
  }, []);

  useDidShow(() => {
    setNotificationsEnabled(readStorage(STORAGE_KEYS.notifications, true));
    setPrivacyLevel(readStorage<string>(STORAGE_KEYS.privacy, "public"));
    if (isApiEnabled()) {
      void profilePindanQuery.refetch();
    } else {
      setMyPindanItems(loadMyPindanItems(myPinDanEvents));
    }
    applyRouteParams();
  });

  useEffect(() => {
    if (!isApiEnabled() || !profilePindanQuery.data) return;
    setMyPindanItems(profilePindanQuery.data);
  }, [profilePindanQuery.data]);

  useEffect(() => {
    if (highlightPindanId == null || activeTab !== `pindan`) return;

    const scrollTimer = window.setTimeout(() => {
      document.getElementById(`profile-pindan-${highlightPindanId}`)?.scrollIntoView({
        behavior: `smooth`,
        block: `center`,
      });
    }, 200);

    const clearTimer = window.setTimeout(() => setHighlightPindanId(null), 2800);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(clearTimer);
    };
  }, [highlightPindanId, activeTab, myPindanItems]);

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

  const handleEventTap = useCallback((item: ProfileEventItem) => {
    void Taro.showToast({ title: item.title, icon: "none" });
  }, []);

  const handleExitPindan = useCallback(
    async (id: number) => {
      if (isApiEnabled()) {
        try {
          await leavePindan(id, getClientUserId());
          setMyPindanItems((prev) => prev.filter((item) => item.id !== id));
        } catch {
          void Taro.showToast({ title: t("common.requestFailed"), icon: "none" });
        }
        return;
      }

      removeJoinedPindanItem(id);
      setMyPindanItems((prev) => prev.filter((item) => item.id !== id));
    },
    [t],
  );

  const openSettings = useCallback(
    (section: "notifications" | "privacy" | "help") => {
      go(`${ROUTES.SETTINGS}?section=${section}`);
    },
    [],
  );

  const handleLogout = useCallback(() => {
    void Taro.showModal({
      title: t("profile.settings.logoutConfirmTitle"),
      content: t("profile.settings.logoutConfirmMessage"),
      confirmText: t("profile.settings.logout"),
      confirmColor: "#ff0066",
      success: (res) => {
        if (res.confirm) {
          void Taro.showToast({ title: t("profile.settings.logoutSuccess"), icon: "success" });
        }
      },
    });
  }, [t]);

  const statusClass = (status: ProfileEventItem["status"]) =>
    `s-profile__event-status s-profile__event-status--${status}`;

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

        <div className="s-profile__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "participated"}
            className={`s-profile__tab${activeTab === "participated" ? " s-profile__tab--active" : ""}`}
            onClick={() => setActiveTab("participated")}
          >
            {t("profile.tabs.participated")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "pindan"}
            className={`s-profile__tab${activeTab === "pindan" ? " s-profile__tab--active" : ""}`}
            onClick={() => setActiveTab("pindan")}
          >
            {t("profile.tabs.pindan")}
          </button>
        </div>

        <div className="s-profile__events">
          {activeTab === "participated" ? (
            participatedEvents.map((event) => (
              <button key={event.id} type="button" className="s-profile__event-row" onClick={() => handleEventTap(event)}>
                <img className="s-profile__event-thumb" src={event.image} alt="" />
                <div className="s-profile__event-info">
                  <div className="s-profile__event-title">{event.title}</div>
                  <div className="s-profile__event-date">
                    <CalendarIcon size={12} />
                    <span>{event.date}</span>
                  </div>
                </div>
                <span className={statusClass(event.status)}>{t(`profile.eventStatus.${event.status}`)}</span>
              </button>
            ))
          ) : (
            <ProfilePinDanList
              items={myPindanItems}
              highlightId={highlightPindanId}
              onExit={handleExitPindan}
            />
          )}
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

      <BottomNav />
    </div>
  );
};

export default Profile;
