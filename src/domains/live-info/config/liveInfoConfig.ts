import {
  AudioWaveform,
  Beer,
  Droplet,
  Footprints,
  Star,
  Toilet,
} from '@/components/icons';
import type { LiveInfoCategoryId } from '@/types/liveInfo';

type LiveInfoIcon = typeof Footprints;

export type { LiveInfoCategoryId };

export type LiveInfoCategoryConfig = {
  id: LiveInfoCategoryId;
  label: string;
  icon: LiveInfoIcon;
  color: string;
  scaleLeft: string;
  scaleRight: string;
  scoreLabel: (score: number) => string;
};

export const LIVE_INFO_CATEGORIES: LiveInfoCategoryConfig[] = [
  {
    id: 'entry_crowd',
    label: '入场拥挤',
    icon: Footprints,
    color: '#ff7043',
    scaleLeft: '很顺畅',
    scaleRight: '非常挤',
    scoreLabel: (s) =>
      s <= 1
        ? '很顺畅'
        : s <= 2
          ? '顺畅'
          : s <= 3
            ? '一般'
            : s <= 4
              ? '较拥挤'
              : '非常挤',
  },
  {
    id: 'toilet_queue',
    label: '厕所排队',
    icon: Toilet,
    color: '#42a5f5',
    scaleLeft: '秒进',
    scaleRight: '超长队',
    scoreLabel: (s) =>
      s <= 1
        ? '秒进'
        : s <= 2
          ? '5分钟'
          : s <= 3
            ? '10分钟'
            : s <= 4
              ? '20分钟'
              : '超长队',
  },
  {
    id: 'water_queue',
    label: '接水排队',
    icon: Droplet,
    color: '#26c6da',
    scaleLeft: '秒进',
    scaleRight: '超长队',
    scoreLabel: (s) =>
      s <= 1
        ? '秒进'
        : s <= 2
          ? '5分钟'
          : s <= 3
            ? '10分钟'
            : s <= 4
              ? '20分钟'
              : '超长队',
  },
  {
    id: 'smoke_drink',
    label: '安检情况',
    icon: Beer,
    color: '#ab47bc',
    scaleLeft: '宽松',
    scaleRight: '严格',
    scoreLabel: (s) =>
      s <= 1
        ? '宽松'
        : s <= 2
          ? '较宽松'
          : s <= 3
            ? '一般'
            : s <= 4
              ? '较严格'
              : '严格',
  },
  {
    id: 'sound_level',
    label: '音量/听感',
    icon: AudioWaveform,
    color: '#ffca28',
    scaleLeft: '很轻',
    scaleRight: '很响/震',
    scoreLabel: (s) =>
      s <= 1 ? '很轻' : s <= 2 ? '偏轻' : s <= 3 ? '适中' : s <= 4 ? '偏响' : '很响/震',
  },
  {
    id: 'stage_view',
    label: '视野',
    icon: Star,
    color: '#66bb6a',
    scaleLeft: '很差',
    scaleRight: '很好',
    scoreLabel: (s) =>
      s <= 1 ? '很差' : s <= 2 ? '一般' : s <= 3 ? '还行' : s <= 4 ? '较好' : '很好',
  },
];

const SCORE_DEFAULTS: Record<LiveInfoCategoryId, number> = {
  entry_crowd: 3,
  toilet_queue: 3,
  water_queue: 3,
  smoke_drink: 3,
  sound_level: 3,
  stage_view: 3,
};

export function defaultLiveInfoScores(): Record<LiveInfoCategoryId, number> {
  return { ...SCORE_DEFAULTS };
}

export function getLiveInfoCategory(id: LiveInfoCategoryId): LiveInfoCategoryConfig {
  return LIVE_INFO_CATEGORIES.find((c) => c.id === id) ?? LIVE_INFO_CATEGORIES[0];
}

export const LIVE_INFO_REMARKS_MAX = 100;
