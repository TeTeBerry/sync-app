import Taro from "@tarojs/taro";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh.json";
import type { AppLocale } from "./types";

export const LOCALE_STORAGE_KEY = "sync-app-locale";
export const SUPPORTED_LOCALES = ["zh", "en", "th"] as const;
export type { AppLocale };

const localeLoaders: Record<
  Exclude<AppLocale, "zh">,
  () => Promise<{ default: Record<string, unknown> }>
> = {
  en: () => import("./locales/en.json"),
  th: () => import("./locales/th.json"),
};

export function readStoredLocale(): AppLocale {
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

export async function ensureLocaleLoaded(locale: AppLocale): Promise<void> {
  if (locale === "zh" || i18n.hasResourceBundle(locale, "translation")) {
    return;
  }

  const loader = localeLoaders[locale];
  const mod = await loader();
  i18n.addResourceBundle(locale, "translation", mod.default, true, true);
}

const initialLocale = readStoredLocale();

void i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
  },
  lng: initialLocale === "zh" ? "zh" : "zh",
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

if (initialLocale !== "zh") {
  void ensureLocaleLoaded(initialLocale).then(() => i18n.changeLanguage(initialLocale));
}

export async function setAppLocale(locale: AppLocale) {
  try {
    Taro.setStorageSync(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* storage unavailable */
  }
  await ensureLocaleLoaded(locale);
  await i18n.changeLanguage(locale);
}

export default i18n;
