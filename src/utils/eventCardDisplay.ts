import { extractYearFromText } from './activityStatus';

export function formatEventDateBadge(date?: string): {
  primary: string;
  secondary: string;
} {
  const trimmed = date?.trim() ?? '';
  if (!trimmed) {
    return { primary: '--', secondary: '' };
  }

  const sameMonthRange = trimmed.match(/(\d{1,2})\/(\d{1,2})\s*[–-]\s*(\d{1,2})/);
  if (sameMonthRange) {
    return {
      primary: sameMonthRange[1],
      secondary: `/${sameMonthRange[2]}-${sameMonthRange[3]}`,
    };
  }

  const slashDate = trimmed.match(/(\d{1,2})\/(\d{1,2})/);
  if (slashDate) {
    return {
      primary: slashDate[1],
      secondary: `/${slashDate[2]}`,
    };
  }

  return { primary: trimmed.slice(0, 2), secondary: '' };
}

export function formatEventFullDate(date?: string, title?: string): string {
  const trimmed = date?.trim() ?? '';
  if (!trimmed) return '';

  const year =
    extractYearFromText(title) ??
    extractYearFromText(trimmed) ??
    new Date().getFullYear();
  const badge = formatEventDateBadge(trimmed);

  if (badge.secondary.includes('-')) {
    const days = badge.secondary.slice(1);
    return `${year}年${badge.primary}月${days}日`;
  }

  if (badge.secondary) {
    const day = badge.secondary.slice(1);
    return `${year}年${badge.primary}月${day}日`;
  }

  return `${year}年${trimmed}`;
}

export function formatEventHeroMetaLine(date?: string, location?: string): string {
  const datePart = date?.trim() ?? '';
  const locationPart = location?.trim() ?? '';
  if (datePart && locationPart) {
    return `${datePart} · ${locationPart}`;
  }
  return datePart || locationPart;
}

export function formatEventHeroSubtitle(title?: string, location?: string): string {
  const year = extractYearFromText(title);
  const locationPart = location?.split(/[·,，]/)[0]?.trim();
  if (locationPart && year) {
    return `${locationPart} ${year}`;
  }
  if (year) return String(year);
  return locationPart ?? '';
}
