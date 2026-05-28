const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function formatAbsoluteDateTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** Event-detail post publish time: relative within 24h, absolute datetime after. */
export function formatPostPublishTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < TWENTY_FOUR_HOURS_MS) {
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;

    const hours = Math.floor(minutes / 60);
    return `${hours} 小时前`;
  }

  return formatAbsoluteDateTime(date);
}
