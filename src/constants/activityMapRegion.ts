export type ActivityMapRegion = 'domestic' | 'overseas' | 'hmt';

export const ACTIVITY_MAP_REGIONS: readonly ActivityMapRegion[] = [
  'domestic',
  'overseas',
  'hmt',
] as const;

export const ACTIVITY_MAP_REGION_LABELS: Record<ActivityMapRegion, string> = {
  domestic: '国内',
  overseas: '海外',
  hmt: '港澳台',
};

export function isOverseasActivityRegion(region?: ActivityMapRegion | null): boolean {
  return region === 'overseas';
}

/** Fallback GCJ-02 coords when API rows predate map fields. */
export const ACTIVITY_MAP_COORD_FALLBACK: Record<
  number,
  { latitude: number; longitude: number; region: ActivityMapRegion }
> = {
  1: { latitude: 12.9367, longitude: 100.8839, region: 'overseas' },
  4: { latitude: 22.704518, longitude: 113.771513, region: 'domestic' },
  5: { latitude: 7.96, longitude: 98.35, region: 'overseas' },
};
