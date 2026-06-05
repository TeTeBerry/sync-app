import { EXPLORE_VENUE_CENTER } from './exploreMapVenue';
import type { ExploreMapUser } from './exploreMapTypes';

function jitter(base: number, spread: number, seed: number): number {
  const t = Math.sin(seed * 12.9898) * 43758.5453;
  const n = t - Math.floor(t);
  return base + (n - 0.5) * spread;
}

const CROWD: Omit<ExploreMapUser, 'id'>[] = [
  {
    name: 'Mia',
    status: 'pulse',
    pulseText: '主舞台见',
    latitude: 22.6978,
    longitude: 113.7742,
  },
  { name: 'K', status: 'onsite', latitude: 22.6969, longitude: 113.7734 },
  { name: 'Luna', status: 'onsite', latitude: 22.6958, longitude: 113.7751 },
  { name: 'Ray', status: 'want', latitude: 22.6949, longitude: 113.7726 },
  {
    name: 'Zed',
    status: 'pulse',
    pulseText: 'VIP 区',
    latitude: 22.6971,
    longitude: 113.7754,
  },
  { name: 'Nox', status: 'onsite', latitude: 22.6962, longitude: 113.776 },
  { name: 'Vee', status: 'want', latitude: 22.6952, longitude: 113.7748 },
  { name: 'Ash', status: 'onsite', latitude: 22.6981, longitude: 113.7738 },
  {
    name: 'Ivy',
    status: 'pulse',
    pulseText: 'A 舞池',
    latitude: 22.6961,
    longitude: 113.7729,
  },
  { name: 'Bo', status: 'want', latitude: 22.6946, longitude: 113.7758 },
  { name: 'Cy', status: 'onsite', latitude: 22.6975, longitude: 113.7722 },
  { name: 'Dex', status: 'onsite', latitude: 22.6956, longitude: 113.7732 },
  {
    name: 'El',
    status: 'pulse',
    pulseText: 'After?',
    latitude: 22.6968,
    longitude: 113.7762,
  },
  { name: 'Fox', status: 'want', latitude: 22.6942, longitude: 113.774 },
  { name: 'Gin', status: 'onsite', latitude: 22.6984, longitude: 113.7756 },
  { name: 'Hex', status: 'onsite', latitude: 22.6959, longitude: 113.772 },
  { name: 'Jade', status: 'want', latitude: 22.6979, longitude: 113.7765 },
  {
    name: 'Kite',
    status: 'pulse',
    pulseText: 'Storm',
    latitude: 22.6964,
    longitude: 113.7736,
  },
  { name: 'Lux', status: 'onsite', latitude: 22.6948, longitude: 113.7768 },
  { name: 'Moss', status: 'onsite', latitude: 22.6986, longitude: 113.7746 },
];

/** 演示用户：场内扎堆 + 自己居中略偏 */
export function buildExploreDemoUsers(): ExploreMapUser[] {
  const self: ExploreMapUser = {
    id: 1,
    name: '我',
    status: 'pulse',
    pulseText: 'Pulse',
    isSelf: true,
    latitude: jitter(EXPLORE_VENUE_CENTER.latitude, 0.00035, 1),
    longitude: jitter(EXPLORE_VENUE_CENTER.longitude, 0.00035, 2),
  };

  const others = CROWD.map((u, i) => ({
    ...u,
    id: 1000 + i,
    latitude: jitter(u.latitude, 0.00025, i + 10),
    longitude: jitter(u.longitude, 0.00025, i + 20),
  }));

  return [self, ...others];
}
