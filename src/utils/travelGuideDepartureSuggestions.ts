import type { TravelGuidePlaceSuggestion } from '../api/sync/travelGuide';
import { TRAVEL_GUIDE_DEPARTURE_CITIES } from '../constants/travelGuideDepartureCities';
import { normalizePercentEncodedText } from './normalizePercentEncodedText';

export type DepartureSuggestionItem = {
  label: string;
  kind: 'city' | 'place';
  city?: string;
  address?: string;
};

/** 从活动地址「深圳·xxx」提取举办城市（仅 UI 默认 region，补全列表走后端 API） */
export function eventCityFromLocation(location?: string): string | undefined {
  const loc = location?.trim();
  if (!loc) return undefined;
  const city = loc.split(/[·,，]/)[0]?.trim();
  return city || loc;
}

/** 后端 place-suggestions 行 → 表单展示项（城市行 title/address/city 相同） */
export function mapPlaceSuggestionsToDepartureItems(
  items: TravelGuidePlaceSuggestion[],
): DepartureSuggestionItem[] {
  const rows: DepartureSuggestionItem[] = [];
  for (const item of items) {
    const label = item.title.trim();
    if (!label) continue;
    const kind: DepartureSuggestionItem['kind'] = isCitySuggestionRow(item)
      ? 'city'
      : 'place';
    rows.push({
      label,
      kind,
      city: item.city?.trim() || undefined,
      address: item.address?.trim() || undefined,
    });
  }
  return rows;
}

/** 本地城市库即时过滤（与后端 filterTravelGuideCitySuggestions 一致） */
export function filterLocalDepartureCitySuggestions(
  query: string,
  limit = 10,
): string[] {
  const q = query.trim();
  if (!q) {
    return TRAVEL_GUIDE_DEPARTURE_CITIES.slice(0, Math.min(limit, 8));
  }
  return TRAVEL_GUIDE_DEPARTURE_CITIES.filter((city) => city.includes(q)).slice(
    0,
    limit,
  );
}

export function localDepartureCitySuggestionItems(
  query: string,
  limit = 10,
): DepartureSuggestionItem[] {
  return filterLocalDepartureCitySuggestions(query, limit).map((city) => ({
    label: city,
    kind: 'city',
    city,
    address: city,
  }));
}

export function mergeDepartureSuggestionItems(
  local: DepartureSuggestionItem[],
  remote: DepartureSuggestionItem[],
  limit = 10,
): DepartureSuggestionItem[] {
  const merged: DepartureSuggestionItem[] = [];
  const seen = new Set<string>();
  for (const item of [...local, ...remote]) {
    const key = `${item.kind}:${item.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}

/** 输入框回显：与下拉主标题一致（POI 名称 / 城市名） */
export function departureDisplayValue(item: DepartureSuggestionItem): string {
  return item.label.trim();
}

/** 提交给后端的 departure 文本（与回显一致） */
export function departureValueForSubmit(item: DepartureSuggestionItem): string {
  return departureDisplayValue(item);
}

/** 补全行里的城市（高德 inputtips 的 district/city），供地理编码 region */
export function departureCityFromSuggestion(
  item: DepartureSuggestionItem,
): string | undefined {
  if (item.kind === 'city') {
    return normalizeCityLabel(item.label) ?? item.label.trim();
  }
  const city = item.city?.trim();
  if (!city) return undefined;
  return normalizeCityLabel(city) ?? city;
}

/** place-suggestions 请求的 region：已选城市 > 关键词锚点 > 空关键词时用活动城市 */
export function suggestionRegionForKeyword(
  keyword: string,
  options?: { departureCity?: string; eventCity?: string },
): string | undefined {
  const picked = options?.departureCity?.trim();
  if (picked) return normalizeCityLabel(picked) ?? picked;
  const q = keyword.trim();
  if (!q) return options?.eventCity?.trim() || undefined;
  return findDepartureCityAnchorInText(q);
}

function findDepartureCityAnchorInText(query: string): string | undefined {
  const q = query.trim();
  if (!q) return undefined;
  if (
    q.endsWith('市') ||
    q.endsWith('省') ||
    q.endsWith('自治区') ||
    q.endsWith('特别行政区')
  ) {
    return normalizeCityLabel(q);
  }
  return undefined;
}

export function findDepartureCityAnchor(query: string): string | undefined {
  const q = query.trim();
  if (!q) return undefined;

  const exact = TRAVEL_GUIDE_DEPARTURE_CITIES.find((city) => city === q);
  if (exact) return exact;

  for (const city of TRAVEL_GUIDE_DEPARTURE_CITIES) {
    if (q.startsWith(city)) return city;
  }

  return findDepartureCityAnchorInText(q);
}

/** 展示 / 提交前统一解码（修复路由参数或缓存中的 percent-encoding） */
export function formatTravelGuideDepartureLabel(value: string): string {
  return normalizePercentEncodedText(value).trim();
}

export function normalizeDepartureForSubmit(value: string): string {
  const trimmed = formatTravelGuideDepartureLabel(value);
  if (!trimmed) return trimmed;
  const endsWithAdmin =
    trimmed.endsWith('市') ||
    trimmed.endsWith('省') ||
    trimmed.endsWith('自治区') ||
    trimmed.endsWith('特别行政区');
  if (endsWithAdmin && !/[区县路街号站]/.test(trimmed)) {
    return normalizeCityLabel(trimmed) ?? trimmed;
  }
  if (trimmed.length <= 4 && !/[区县路街号站]/.test(trimmed)) {
    return normalizeCityLabel(trimmed) ?? trimmed;
  }
  return trimmed;
}

/**
 * Align departureCity with departure text on submit.
 * Fixes stale city anchor when user switches city during regenerate.
 */
export function resolveDepartureCityForSubmit(
  departure: string,
  departureCity?: string,
): string | undefined {
  const normalizedDeparture = normalizeDepartureForSubmit(departure);
  const anchor = findDepartureCityAnchor(normalizedDeparture);
  const picked = departureCity?.trim()
    ? (normalizeCityLabel(departureCity.trim()) ?? departureCity.trim())
    : undefined;

  if (anchor) {
    if (!picked || picked === anchor || normalizedDeparture.startsWith(anchor)) {
      return anchor;
    }
  }

  return picked;
}

function isCitySuggestionRow(item: TravelGuidePlaceSuggestion): boolean {
  const title = item.title.trim();
  const address = item.address.trim();
  if (title !== address) return false;
  const city = item.city?.trim();
  return !city || city === title || normalizeCityLabel(city) === title;
}

export function normalizeCityLabel(city?: string): string | undefined {
  const trimmed = city?.trim();
  if (!trimmed) return undefined;
  const stripped = trimmed
    .replace(/(特别行政区|自治州|地区|盟)$/, '')
    .replace(/[省市]$/, '');
  return stripped || trimmed;
}
