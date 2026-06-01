import type { TravelGuidePlaceSuggestion } from '../api/sync/travelGuide';

export type DepartureSuggestionItem = {
  label: string;
  kind: 'city' | 'place';
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
      return { label, kind };
    })
    .filter((row): row is DepartureSuggestionItem => row != null);
}

function isCitySuggestionRow(item: TravelGuidePlaceSuggestion): boolean {
  const title = item.title.trim();
  const address = item.address.trim();
  if (title !== address) return false;
  const city = item.city?.trim();
  return !city || city === title;
}

export function normalizeDepartureForSubmit(value: string): string {
  return value.trim();
}
