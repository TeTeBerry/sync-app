export type StormFloorZoneId = 'masterField' | 'aArea' | 'bArea' | 'vip';

export type StormFloorDot = {
  id: string;
  top: number;
  left: number;
  color: string;
  size: number;
  delay: number;
};

type StormFloorZoneConfig = {
  id: StormFloorZoneId;
  leftMin: number;
  leftMax: number;
  topMin: number;
  topMax: number;
  dotCount: number;
  seed: number;
};

const CROWD_DOT_COLORS = [
  '#ff2d55',
  '#7b61ff',
  '#00e5ff',
  '#22c55e',
  '#f97316',
  '#eab308',
  '#60a5fa',
  '#ff00aa',
  '#a855f7',
  '#34d399',
];

const STORM_FLOOR_ZONES: StormFloorZoneConfig[] = [
  {
    id: 'masterField',
    leftMin: 4,
    leftMax: 19,
    topMin: 41,
    topMax: 69,
    dotCount: 9,
    seed: 11,
  },
  {
    id: 'aArea',
    leftMin: 24,
    leftMax: 47,
    topMin: 35,
    topMax: 75,
    dotCount: 16,
    seed: 29,
  },
  {
    id: 'bArea',
    leftMin: 53,
    leftMax: 76,
    topMin: 35,
    topMax: 75,
    dotCount: 16,
    seed: 47,
  },
  {
    id: 'vip',
    leftMin: 81,
    leftMax: 96,
    topMin: 41,
    topMax: 69,
    dotCount: 9,
    seed: 71,
  },
];

function hash01(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildZoneDots(zone: StormFloorZoneConfig): StormFloorDot[] {
  const dots: StormFloorDot[] = [];
  for (let i = 0; i < zone.dotCount; i += 1) {
    const r1 = hash01(zone.seed + i * 3.17);
    const r2 = hash01(zone.seed + i * 3.17 + 1.31);
    const r3 = hash01(zone.seed + i * 3.17 + 2.57);
    const r4 = hash01(zone.seed + i * 3.17 + 3.83);
    dots.push({
      id: `${zone.id}-${i}`,
      top: zone.topMin + r1 * (zone.topMax - zone.topMin),
      left: zone.leftMin + r2 * (zone.leftMax - zone.leftMin),
      color: CROWD_DOT_COLORS[Math.floor(r3 * CROWD_DOT_COLORS.length)] ?? '#00e5ff',
      size: 4 + Math.floor(r4 * 4),
      delay: r3 * 2.4,
    });
  }
  return dots;
}

export function buildStormFloorCrowdDots(): StormFloorDot[] {
  return STORM_FLOOR_ZONES.flatMap(buildZoneDots);
}
