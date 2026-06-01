import { Beer, Droplet, Footprints, Toilet } from 'lucide-react-taro';

type LiveInfoIcon = typeof Footprints;

export type LiveInfoCategoryId =
  | 'entry_crowd'
  | 'toilet_queue'
  | 'water_queue'
  | 'smoke_drink';

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
    scaleLeft: '充足',
    scaleRight: '紧缺',
    scoreLabel: (s) =>
      s <= 1 ? '充足' : s <= 2 ? '较充足' : s <= 3 ? '一般' : s <= 4 ? '偏紧' : '紧缺',
  },
];

export function getLiveInfoCategory(id: LiveInfoCategoryId): LiveInfoCategoryConfig {
  return LIVE_INFO_CATEGORIES.find((c) => c.id === id) ?? LIVE_INFO_CATEGORIES[0];
}

export const LIVE_INFO_REMARKS_MAX = 100;
