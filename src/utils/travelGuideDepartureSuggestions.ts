import type { TravelGuidePlaceSuggestion } from '../api/sync/travelGuide';

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

/** 输入框回显：POI 优先完整 address，城市用 label */
export function departureDisplayValue(item: DepartureSuggestionItem): string {
  const label = item.label.trim();
  if (item.kind === 'city') {
    return label;
  }
  const address = item.address?.trim();
  if (!address) return label;
  if (address === label) return label;
  if (address.includes(label)) return address;
  if (label.includes(address)) return label;
  return address.length >= label.length ? address : label;
}

/**
 * 提交给后端的 departure 文本（与回显一致，便于 geocode）。
 */
export function departureValueForSubmit(item: DepartureSuggestionItem): string {
  return departureDisplayValue(item);
}

/** 补全行里的城市（腾讯 `city` 字段），供地理编码与后续搜索 region */
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

export function normalizeDepartureForSubmit(value: string): string {
  const trimmed = value.trim();
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
