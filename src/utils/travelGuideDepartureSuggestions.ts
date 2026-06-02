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
  return items
    .map((item) => {
      const label = item.title.trim();
      if (!label) return null;
      const kind: DepartureSuggestionItem['kind'] = isCitySuggestionRow(item)
        ? 'city'
        : 'place';
      return {
        label,
        kind,
        city: item.city?.trim() || undefined,
        address: item.address?.trim() || undefined,
      };
    })
    .filter((row): row is DepartureSuggestionItem => row != null);
}

/**
 * Value stored on submit / sent to generate API.
 * Cross-city guide uses city-level departure; POI picks coerce to city when possible.
 */
export function departureValueForSubmit(item: DepartureSuggestionItem): string {
  if (item.kind === 'city') {
    return item.label.trim();
  }

  const fromCity = normalizeCityLabel(item.city);
  if (fromCity) return fromCity;

  const fromAddress = extractCityFromAddress(item.address);
  if (fromAddress) return fromAddress;

  const address = item.address?.trim();
  if (address && address.length > item.label.length) {
    return address;
  }

  return item.label.trim();
}

/** Whether picking this row will change the visible label (POI → city). */
export function departurePickCoercedFromPlace(item: DepartureSuggestionItem): boolean {
  if (item.kind !== 'place') return false;
  return departureValueForSubmit(item) !== item.label.trim();
}

export function normalizeDepartureForSubmit(value: string): string {
  const trimmed = value.trim();
  const anchor = normalizeCityLabel(trimmed);
  return anchor || trimmed;
}

function isCitySuggestionRow(item: TravelGuidePlaceSuggestion): boolean {
  const title = item.title.trim();
  const address = item.address.trim();
  if (title !== address) return false;
  const city = item.city?.trim();
  return !city || city === title || normalizeCityLabel(city) === title;
}

function normalizeCityLabel(city?: string): string | undefined {
  const trimmed = city?.trim();
  if (!trimmed) return undefined;
  const stripped = trimmed
    .replace(/(特别行政区|自治州|地区|盟)$/, '')
    .replace(/[省市]$/, '');
  return stripped || trimmed;
}

function extractCityFromAddress(address?: string): string | undefined {
  const trimmed = address?.trim();
  if (!trimmed) return undefined;

  const adminMatch = trimmed.match(/^(.+?(?:市|省|自治区|特别行政区))/);
  if (adminMatch?.[1]) {
    return normalizeCityLabel(adminMatch[1]);
  }

  const first = trimmed.split(/[,，]/)[0]?.trim();
  return first ? normalizeCityLabel(first) : undefined;
}
