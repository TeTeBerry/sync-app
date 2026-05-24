import "./settings.scss";
import Taro, { useRouter } from "@tarojs/taro";
import React, { useCallback, useState } from "react";
import { CheckIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import PageNavigation from "../../components/PageNavigation";
import { ROUTES } from "../../utils/route";

type SettingsSection = "notifications" | "privacy" | "help";
type PrivacyLevel = "public" | "friends" | "private";

const STORAGE_KEYS = {
  notifications: "profile.notificationsEnabled",
  privacy: "profile.privacyLevel",
} as const;

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
  const { t } = useTranslation();
  const router = useRouter();
  const section = (router.params.section ?? "notifications") as SettingsSection;

  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    readBool(STORAGE_KEYS.notifications, true),
  );
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>(() =>
    readPrivacy(STORAGE_KEYS.privacy, "public"),
  );

  const titleKey = `profile.settings.${section}Title` as const;

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      Taro.setStorageSync(STORAGE_KEYS.notifications, next);
      return next;
    });
  }, []);

  const selectPrivacy = useCallback((level: PrivacyLevel) => {
    setPrivacyLevel(level);
    Taro.setStorageSync(STORAGE_KEYS.privacy, level);
    void Taro.showToast({ title: t("profile.settings.saved"), icon: "success" });
  }, [t]);

  const submitFeedback = useCallback(() => {
    void Taro.showToast({ title: t("profile.settings.feedbackSent"), icon: "success" });
  }, [t]);

  const privacyOptions: PrivacyLevel[] = ["public", "friends", "private"];

  return (
    <div data-cmp="Settings" className="s-settings">
      <PageNavigation title={t(titleKey)} fallback={ROUTES.PROFILE} />

      <main className="s-settings__main">
        {section === "notifications" && (
          <div className="s-settings__card">
            <div className="s-settings__row">
              <div>
                <div className="s-settings__row-label">{t("profile.settings.pushNotifications")}</div>
                <div className="s-settings__row-desc">{t("profile.settings.pushNotificationsDesc")}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                className={`s-settings__toggle${notificationsEnabled ? " s-settings__toggle--on" : ""}`}
                onClick={toggleNotifications}
              >
                <span className="s-settings__toggle-knob" />
              </button>
            </div>
            <div className="s-settings__row">
              <div>
                <div className="s-settings__row-label">{t("profile.settings.activityReminders")}</div>
                <div className="s-settings__row-desc">{t("profile.settings.activityRemindersDesc")}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                className={`s-settings__toggle${notificationsEnabled ? " s-settings__toggle--on" : ""}`}
                onClick={toggleNotifications}
              >
                <span className="s-settings__toggle-knob" />
              </button>
            </div>
          </div>
        )}

        {section === "privacy" && (
          <div className="s-settings__card">
            {privacyOptions.map((level) => (
              <button
                key={level}
                type="button"
                className={`s-settings__option${privacyLevel === level ? " s-settings__option--selected" : ""}`}
                onClick={() => selectPrivacy(level)}
              >
                <div>
                  <div className="s-settings__option-label">{t(`profile.settings.privacyOptions.${level}`)}</div>
                  <div className="s-settings__option-desc">{t(`profile.settings.privacyDesc.${level}`)}</div>
                </div>
                {privacyLevel === level && <CheckIcon size={20} className="s-settings__check" />}
              </button>
            ))}
          </div>
        )}

        {section === "help" && (
          <>
            <div className="s-settings__card s-settings__faq">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="s-settings__faq-item">
                  <div className="s-settings__faq-q">{t(`profile.settings.faq.q${idx}`)}</div>
                  <div className="s-settings__faq-a">{t(`profile.settings.faq.a${idx}`)}</div>
                </div>
              ))}
            </div>
            <button type="button" className="s-settings__feedback-btn" onClick={submitFeedback}>
              {t("profile.settings.submitFeedback")}
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default SettingsPage;
