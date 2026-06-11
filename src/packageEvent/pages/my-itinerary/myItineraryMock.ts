export type ItineraryTimelineDotColor = 'pink' | 'cyan' | 'purple';

export type ItineraryTimelinePill = {
  label: string;
  variant: 'green' | 'pink';
};

export type ItineraryTimelineItem = {
  id: string;
  time: string;
  dotColor: ItineraryTimelineDotColor;
  title: string;
  subtitle?: string;
  timeTag?: string;
  timeTagColor?: ItineraryTimelineDotColor;
  pill?: ItineraryTimelinePill;
  highlighted?: boolean;
};

export type ItineraryDay = {
  id: string;
  label: string;
  bannerDateLabel: string;
  nodeCount: number;
  items: ItineraryTimelineItem[];
};

export const MY_ITINERARY_EVENT_META = '风暴电音节 深圳站';

export const MY_ITINERARY_DAYS: ItineraryDay[] = [
  {
    id: 'jun13',
    label: '6月13日',
    bannerDateLabel: '6月13日',
    nodeCount: 4,
    items: [
      {
        id: 'depart',
        time: '17:30',
        dotColor: 'pink',
        title: '出发前往场馆',
        subtitle: '建议提前 1.5 小时出发，预留安检与入场时间',
        pill: { label: '出行提醒', variant: 'green' },
      },
      {
        id: 'excision',
        time: '19:00',
        dotColor: 'cyan',
        title: 'EXCISION · 主舞台',
        subtitle: 'Brostep 专场',
        timeTag: '19:00-20:15',
        timeTagColor: 'cyan',
      },
      {
        id: 'marshmello',
        time: '20:30',
        dotColor: 'pink',
        title: 'MARSHMELLO · 主舞台',
        subtitle: '6月13日头条 · 你的必看之选',
        timeTag: '20:30-22:00',
        timeTagColor: 'pink',
        pill: { label: '重点演出 · 必看', variant: 'pink' },
        highlighted: true,
      },
      {
        id: 'afterparty',
        time: '22:00',
        dotColor: 'purple',
        title: '散场返程',
        subtitle: '预留打车与地铁末班车时间',
      },
    ],
  },
  {
    id: 'jun14',
    label: '6月14日',
    bannerDateLabel: '6月14日',
    nodeCount: 4,
    items: [
      {
        id: 'brunch',
        time: '12:00',
        dotColor: 'pink',
        title: '午间休息',
        subtitle: '补充能量，为下午场做准备',
        pill: { label: '休息推荐', variant: 'green' },
      },
      {
        id: 'eric-prydz',
        time: '19:00',
        dotColor: 'cyan',
        title: 'ERIC PRYDZ · 主舞台',
        subtitle: 'Progressive House · Electro',
        timeTag: '19:00-20:20',
        timeTagColor: 'cyan',
      },
      {
        id: 'illenium',
        time: '20:20',
        dotColor: 'purple',
        title: 'ILLENIUM · 主舞台',
        subtitle: '6月14日压轴 · Melodic Dubstep',
        timeTag: '20:20-22:00',
        timeTagColor: 'purple',
        pill: { label: '重点演出 · 必看', variant: 'pink' },
        highlighted: true,
      },
      {
        id: 'afterparty',
        time: '22:00',
        dotColor: 'purple',
        title: '散场返程',
        subtitle: 'Day2 收官',
      },
    ],
  },
];

export function parseSelectedDjIds(raw?: string): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export type DjNameEntry = { id: string; name: string };

export function resolveDjDisplayNames(ids: string[], catalog: DjNameEntry[]): string[] {
  return ids
    .map((id) => catalog.find((dj) => dj.id === id)?.name)
    .filter((name): name is string => Boolean(name));
}

/** Performance nodes from generated days (title: `Artist · Stage`). */
export function extractPerformanceArtistsFromDays(days: ItineraryDay[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const day of days) {
    for (const item of day.items) {
      if (item.pill?.label === '出行提醒') continue;
      if (/出发|散场|休息|午间/.test(item.title)) continue;
      const sep = item.title.indexOf('·');
      if (sep < 0) continue;
      const artist = item.title.slice(0, sep).trim();
      if (!artist || seen.has(artist)) continue;
      seen.add(artist);
      names.push(artist);
    }
  }

  return names;
}

export function buildItineraryBannerCopy(input: {
  selectedDjIds: string[];
  selectedDjNames: string[];
  itineraryArtistNames: string[];
  eventMeta: string;
  dayLabels: string[];
}): { title: string; subtitle: string } {
  const names =
    input.selectedDjNames.length > 0
      ? input.selectedDjNames
      : input.itineraryArtistNames;

  const count =
    input.selectedDjIds.length > 0 ? input.selectedDjIds.length : names.length;

  const title =
    count > 0 ? `已根据你选择的 ${count} 位 DJ 生成电音时间表` : '你的电音时间表已生成';

  const namesLine = names.length > 0 ? names.join(' · ') : '';
  const daysLine =
    input.dayLabels.length > 1
      ? `覆盖 ${input.dayLabels.join('、')}`
      : (input.dayLabels[0] ?? '');

  const subtitle = [namesLine, input.eventMeta.trim(), daysLine]
    .filter((part) => part.length > 0)
    .join(' · ');

  return { title, subtitle: subtitle || input.eventMeta };
}
