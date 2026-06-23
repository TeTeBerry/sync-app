import type { ActivityMapRegion } from '../constants/activityMapRegion';
import { t } from '@/i18n';
import type { EventCardUi } from './apiMappers';

/** Catalog `area` values from the API → i18n slug under `activity.areas.*`. */
const ACTIVITY_AREA_I18N_IDS: Record<string, string> = {
  中国: 'china',
  日本: 'japan',
  韩国: 'korea',
  泰国: 'thailand',
  新加坡: 'singapore',
  马来西亚: 'malaysia',
  印尼: 'indonesia',
  越南: 'vietnam',
  菲律宾: 'philippines',
  中国香港: 'hongKong',
  中国澳门: 'macao',
  中国台湾: 'taiwan',
  荷兰: 'netherlands',
  比利时: 'belgium',
  罗马尼亚: 'romania',
  英国: 'uk',
  阿联酋: 'uae',
  美国: 'usa',
  沙特: 'saudi',
  克罗地亚: 'croatia',
};

/** Catalog `location` values from the API → i18n slug under `activity.locations.*`. */
const ACTIVITY_LOCATION_I18N_IDS: Record<string, string> = {
  '芭提雅 Wisdom Valley': 'pattayaWisdomValley',
  '荷兰·比丁赫伊普 Walibi Holland': 'netherlandsWalibiHolland',
  '韩国·首尔乐园 Seoul Land': 'koreaSeoulLand',
  深圳国际会展中心: 'shenzhenConventionCenter',
  '普吉岛 Rhythm Park': 'phuketRhythmPark',
  '日本·东京 海の森水上競技場': 'japanTokyoUmiNoMori',
  '比利时·Boom De Schorre': 'belgiumBoomDeSchorre',
  '仁川 Inspire Entertainment Resort': 'incheonInspireResort',
  '罗马尼亚·克卢日 Cluj Arena': 'romaniaClujArena',
  '英国·沃灵顿 Daresbury Estate': 'ukWarringtonDaresbury',
  '日本·东京 台场': 'japanTokyoOdaiba',
  '阿联酋·迪拜 Dubai Parks and Resorts': 'uaeDubaiParks',
  '美国·奥兰多 Tinker Field': 'usaOrlandoTinkerField',
  '沙特·利雅得 Boulevard Riyadh': 'saudiRiyadhBoulevard',
  '克罗地亚·斯普利特 Park Mladeži': 'croatiaSplitParkMladezi',
};

function translateCatalogValue(
  group: 'areas' | 'locations' | 'mapRegions',
  id: string,
  fallback: string,
): string {
  const key = `activity.${group}.${id}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function formatActivityRegionLabel(region?: ActivityMapRegion): string | null {
  if (!region) {
    return null;
  }
  return translateCatalogValue('mapRegions', region, region);
}

export function formatActivityAreaLabel(
  event: Pick<EventCardUi, 'area' | 'region'>,
): string | null {
  const area = event.area?.trim();
  if (area) {
    const id = ACTIVITY_AREA_I18N_IDS[area];
    if (id) {
      return translateCatalogValue('areas', id, area);
    }
    return area;
  }
  return formatActivityRegionLabel(event.region);
}

export function formatActivityLocationLabel(location?: string): string {
  const trimmed = location?.trim();
  if (!trimmed) {
    return '';
  }
  const id = ACTIVITY_LOCATION_I18N_IDS[trimmed];
  if (id) {
    return translateCatalogValue('locations', id, trimmed);
  }
  return trimmed;
}
