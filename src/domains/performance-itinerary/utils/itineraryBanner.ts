import type { ItineraryDay } from '../types/myItineraryUi';

export function parseSelectedDjIds(raw?: string): string[] {
  return parseSelectedDjList(raw);
}

/** Pipe-delimited lists avoid comma-splitting issues in mini-program route params. */
export function parseSelectedDjList(raw?: string): string[] {
  if (!raw?.trim()) {
    return [];
  }
  const delimiter = raw.includes('|') ? '|' : ',';
  return raw
    .split(delimiter)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function encodeSelectedDjList(values: string[]): string {
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .join('|');
}

export type DjNameEntry = { id: string; name: string };

export function resolveDjDisplayNames(ids: string[], catalog: DjNameEntry[]): string[] {
  return ids
    .map((id) => catalog.find((dj) => dj.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

/** Performance nodes from generated days (title: `Artist · Stage`). */
export function extractPerformanceArtistsFromDays(days: ItineraryDay[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const day of days) {
    for (const item of day.items) {
      if (item.pill?.label === '出行提醒') continue;
      if (/出发|散场|休息|午间/.test(item.title)) continue;
      const sep = item.title.indexOf('·');
      if (sep < 0) continue;
      const artist = item.title.slice(0, sep).trim();
      if (!artist || seen.has(artist)) continue;
      seen.add(artist);
      names.push(artist);
    }
  }

  return names;
}

export function buildItineraryBannerCopy(input: {
  selectedDjIds: string[];
  selectedDjNames: string[];
  itineraryArtistNames: string[];
  eventMeta: string;
  dayLabels: string[];
}): { title: string; subtitle: string } {
  const names =
    input.selectedDjNames.length > 0
      ? input.selectedDjNames
      : input.itineraryArtistNames;

  const count =
    input.selectedDjIds.length > 0 ? input.selectedDjIds.length : names.length;

  const title =
    count > 0 ? `已根据你选择的 ${count} 位 DJ 生成电音时间表` : '你的电音时间表已生成';

  const namesLine = names.length > 0 ? names.join(' · ') : '';
  const daysLine =
    input.dayLabels.length > 1
      ? `覆盖 ${input.dayLabels.join('、')}`
      : (input.dayLabels[0] ?? '');

  const subtitle = [namesLine, input.eventMeta.trim(), daysLine]
    .filter((part) => part.length > 0)
    .join(' · ');

  return { title, subtitle: subtitle || input.eventMeta };
}
