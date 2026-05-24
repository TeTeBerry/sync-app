import Taro from "@tarojs/taro";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import th from "./locales/th.json";
import zh from "./locales/zh.json";

export const LOCALE_STORAGE_KEY = "sync-app-locale";
export const SUPPORTED_LOCALES = ["zh", "en", "th"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

function readStoredLocale(): AppLocale {
  try {
    const stored = Taro.getStorageSync(LOCALE_STORAGE_KEY) as string;
    if (SUPPORTED_LOCALES.includes(stored as AppLocale)) {
      return stored as AppLocale;
    }
  } catch {
    /* storage unavailable */
  }
  return "zh";
}

void i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
    th: { translation: th },
  },
  lng: readStoredLocale(),
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

export async function setAppLocale(locale: AppLocale) {
  try {
    Taro.setStorageSync(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* storage unavailable */
  }
  await i18n.changeLanguage(locale);
}

export default i18n;
