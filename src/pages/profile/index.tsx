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
import { useProfilePindanQuery, useProfileTicketsQuery } from "../../hooks/useSyncApi";
import { leavePindan } from "../../api/syncApi";
import { isApiEnabled } from "../../constants/api";
import { go, ROUTES } from "../../utils/route";
import {
  participatedEvents,
  myPinDanEvents,
  myTicketEvents,
  profileUser,
  type ProfileEventItem,
} from "./mockData";
import ProfilePinDanList from "./components/ProfilePinDanList";
import ProfileTicketList from "./components/ProfileTicketList";
import { loadMyPindanItems, removeJoinedPindanItem } from "../../utils/myPindanStorage";
import { getClientUserId, persistUserName } from "../../utils/session";
import {
  useNavigationStore,
  useProfilePageStore,
  usePindanSessionStore,
  useScrollHighlight,
} from "../../stores";

type ProfileTab = "participated" | "pindan" | "tickets";

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
  const tabParam = params?.tab;
  const tab: ProfileTab | null =
    tabParam === "pindan" || tabParam === "tickets" ? tabParam : null;
  const highlightId = Number(params?.highlightId);
  const highlightTicketId = params?.highlightTicketId?.trim() || null;
  return {
    tab,
    highlightId: highlightId && !Number.isNaN(highlightId) ? highlightId : null,
    highlightTicketId,
  };
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const profilePindanQuery = useProfilePindanQuery();
  const profileTicketsQuery = useProfileTicketsQuery();
  const settingsRef = useRef<HTMLDivElement>(null);
  const activeTab = useProfilePageStore((state) => state.activeTab);
  const highlightPindanId = useProfilePageStore((state) => state.highlightPindanId);
  const highlightTicketId = useProfilePageStore((state) => state.highlightTicketId);
  const notificationsEnabled = useProfilePageStore((state) => state.notificationsEnabled);
  const privacyLevel = useProfilePageStore((state) => state.privacyLevel);
  const setActiveTab = useProfilePageStore((state) => state.setActiveTab);
  const applyRoute = useProfilePageStore((state) => state.applyRoute);
  const clearHighlight = useProfilePageStore((state) => state.clearHighlight);
  const setNotificationsEnabled = useProfilePageStore((state) => state.setNotificationsEnabled);
  const setPrivacyLevel = useProfilePageStore((state) => state.setPrivacyLevel);
  const removeJoinedId = usePindanSessionStore((state) => state.removeJoinedId);
  const consumeProfileIntent = useNavigationStore((state) => state.consumeProfileIntent);
  const [myPindanItems, setMyPindanItems] = useState(() => loadMyPindanItems(myPinDanEvents));
  const [myTicketItems, setMyTicketItems] = useState(myTicketEvents);

  const applyRouteParams = useCallback(() => {
    const urlParams = parseProfileRouteParams();
    const navIntent = consumeProfileIntent();
    applyRoute({
      tab: navIntent?.tab ?? urlParams.tab,
      highlightId: navIntent?.highlightId ?? urlParams.highlightId,
      highlightTicketId: navIntent?.highlightTicketId ?? urlParams.highlightTicketId,
    });
  }, [applyRoute, consumeProfileIntent]);

  useDidShow(() => {
    setNotificationsEnabled(readStorage(STORAGE_KEYS.notifications, true));
    setPrivacyLevel(readStorage<string>(STORAGE_KEYS.privacy, "public"));
    if (isApiEnabled()) {
      void profilePindanQuery.refetch();
      void profileTicketsQuery.refetch();
    } else {
      setMyPindanItems(loadMyPindanItems(myPinDanEvents));
      setMyTicketItems(myTicketEvents);
    }
    applyRouteParams();
  });

  useEffect(() => {
    persistUserName(profileUser.name);
  }, []);

  useEffect(() => {
    if (!isApiEnabled() || !profilePindanQuery.data) return;
    setMyPindanItems(profilePindanQuery.data);
  }, [profilePindanQuery.data]);

  useEffect(() => {
    if (!isApiEnabled() || !profileTicketsQuery.data) return;
    setMyTicketItems(profileTicketsQuery.data);
  }, [profileTicketsQuery.data]);

  useScrollHighlight({
    highlightId: highlightPindanId,
    elementId: (id) => `profile-pindan-${id}`,
    enabled: activeTab === "pindan",
    ready: highlightPindanId == null || myPindanItems.some((item) => item.id === highlightPindanId),
    scrollDelayMs: 200,
    onClear: clearHighlight,
  });

  useScrollHighlight({
    highlightId: highlightTicketId,
    elementId: (id) => `profile-ticket-${id}`,
    enabled: activeTab === "tickets",
    ready:
      highlightTicketId == null ||
      myTicketItems.some((item) => item.id === highlightTicketId),
    scrollDelayMs: 200,
    onClear: clearHighlight,
  });

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
          removeJoinedId(id);
        } catch {
          void Taro.showToast({ title: t("common.requestFailed"), icon: "none" });
        }
        return;
      }

      removeJoinedPindanItem(id);
      setMyPindanItems((prev) => prev.filter((item) => item.id !== id));
      removeJoinedId(id);
    },
    [removeJoinedId, t],
  );

  const handleDeletePindan = useCallback((id: number) => {
    setMyPindanItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

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
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tickets"}
            className={`s-profile__tab${activeTab === "tickets" ? " s-profile__tab--active" : ""}`}
            onClick={() => setActiveTab("tickets")}
          >
            {t("profile.tabs.tickets")}
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
          ) : activeTab === "pindan" ? (
            <ProfilePinDanList
              items={myPindanItems}
              highlightId={highlightPindanId}
              isLoading={isApiEnabled() && profilePindanQuery.isLoading}
              isError={isApiEnabled() && profilePindanQuery.isError}
              onRetry={() => void profilePindanQuery.refetch()}
              onExit={handleExitPindan}
              onDeleted={handleDeletePindan}
              onRefresh={() => void profilePindanQuery.refetch()}
            />
          ) : (
            <ProfileTicketList
              items={myTicketItems}
              highlightId={highlightTicketId}
              isLoading={isApiEnabled() && profileTicketsQuery.isLoading}
              isError={isApiEnabled() && profileTicketsQuery.isError}
              onRetry={() => void profileTicketsQuery.refetch()}
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
