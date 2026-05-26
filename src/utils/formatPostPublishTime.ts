import type { TFunction } from "i18next";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function toLocaleTag(locale: string): string {
  if (locale === "zh") return "zh-CN";
  if (locale === "th") return "th-TH";
  return "en-US";
}

function formatAbsoluteDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(toLocaleTag(locale), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Event-detail post publish time: relative within 24h, absolute datetime after. */
export function formatPostPublishTime(
  iso: string,
  t: TFunction,
  locale = "zh",
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < TWENTY_FOUR_HOURS_MS) {
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return t("notifications.time.justNow");
    if (minutes < 60) return t("notifications.time.minutesAgo", { count: minutes });

    const hours = Math.floor(minutes / 60);
    return t("notifications.time.hoursAgo", { count: hours });
  }

  return formatAbsoluteDateTime(date, locale);
}
